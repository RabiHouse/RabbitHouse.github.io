import Parser from 'rss-parser';
import TurndownService from 'turndown';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// ==== 設定 ====
const NOTE_USERNAME = process.env.NOTE_USERNAME || 'rabbitflower';
const NOTE_RSS_URL = process.env.NOTE_RSS_URL || `https://note.com/${NOTE_USERNAME}/rss`;
const POSTS_DIR = path.join(process.cwd(), '_posts');
const AUTHOR = 'Rabbitflower';
const TAGS = 'note,blog';
const UA = 'Mozilla/5.0 (compatible; note-sync-bot/1.0)';

// note本文が入っているコンテナのクラス名候補（noteの仕様変更に備えて複数試す）
const BODY_SELECTORS = [
  '.note-common-styles__textnote-body',
  'div[class*="note-common-styles__textnote-body"]',
  'article .note-common-styles__body',
];

const parser = new Parser();
const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

function extractNoteId(link) {
  const m = link && link.match(/\/n\/(n[0-9a-zA-Z]+)/);
  return m ? m[1] : null;
}

function getExistingNoteIds() {
  const ids = new Set();
  if (!fs.existsSync(POSTS_DIR)) return ids;
  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!file.endsWith('.md')) continue;
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const m = content.match(/^note_id:\s*(\S+)/m);
    if (m) ids.add(m[1]);
  }
  return ids;
}

function nextNoteNumber() {
  let max = 0;
  if (!fs.existsSync(POSTS_DIR)) return 1;
  for (const file of fs.readdirSync(POSTS_DIR)) {
    const m = file.match(/note(\d+)\.md$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

function escapeYamlString(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function fetchArticlePage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    throw new Error(`記事ページの取得に失敗しました (status ${res.status}): ${url}`);
  }
  return res.text();
}

function extractThumbnail($) {
  return (
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    $('meta[name="thumbnail"]').attr('content') ||
    ''
  );
}

function extractBodyHtml($) {
  for (const selector of BODY_SELECTORS) {
    const el = $(selector).first();
    if (el && el.length && el.html() && el.html().trim().length > 0) {
      return el.html();
    }
  }
  return null;
}

async function main() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

  const feed = await parser.parseURL(NOTE_RSS_URL);
  const existingIds = getExistingNoteIds();
  let nextNum = nextNoteNumber();

  // 古い記事から順に処理（番号・並び順を投稿日順に保つため）
  const items = [...feed.items].reverse();

  let created = 0;
  let skippedNoBody = 0;

  for (const item of items) {
    const noteId = extractNoteId(item.link);
    if (!noteId) {
      console.log(`[skip] noteIDを取得できませんでした: ${item.link}`);
      continue;
    }
    if (existingIds.has(noteId)) {
      continue; // 既に取り込み済み
    }

    console.log(`[fetch] ${item.link}`);
    let html;
    try {
      html = await fetchArticlePage(item.link);
    } catch (err) {
      console.error(`[error] ${err.message}`);
      continue;
    }

    const $ = cheerio.load(html);
    const image = extractThumbnail($);
    const bodyHtml = extractBodyHtml($);

    if (!bodyHtml) {
      // 本文を取得できない場合は、壊れた記事を作らず処理をスキップする
      console.warn(
        `[warn] 本文を取得できなかったためスキップしました（noteの構造が変わった可能性があります）: ${item.link}`
      );
      skippedNoBody += 1;
      continue;
    }

    const markdown = turndown.turndown(bodyHtml).trim();

    const pubDate = new Date(item.pubDate || item.isoDate || Date.now());
    const isoDate = pubDate.toISOString();
    const fileDatePrefix = isoDate.slice(0, 10);

    const filename = `${fileDatePrefix}-note${String(nextNum).padStart(3, '0')}.md`;
    nextNum += 1;

    const frontMatter = [
      '---',
      `title: "${escapeYamlString(item.title || '')}"`,
      `date: "${isoDate}"`,
      'layout: post',
      `author: ${AUTHOR}`,
      `image: ${image}`,
      'categories: ',
      `tags: ${TAGS}`,
      `note_id: ${noteId}`,
      `note_url: ${item.link}`,
      '---',
      '',
    ].join('\n');

    const body = `${markdown}\n\n[元記事はこちら](${item.link})\n`;

    fs.writeFileSync(path.join(POSTS_DIR, filename), frontMatter + body, 'utf8');
    console.log(`[created] ${filename}`);
    created += 1;

    // note側への配慮として少し間隔をあける
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`${created} 件の新しい記事を作成しました。`);
  if (skippedNoBody > 0) {
    console.log(`${skippedNoBody} 件は本文を取得できずスキップしました。`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
