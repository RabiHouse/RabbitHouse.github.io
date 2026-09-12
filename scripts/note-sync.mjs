import Parser from 'rss-parser';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';

// ==== 設定 ====
const NOTE_RSS_URL = process.env.NOTE_RSS_URL || 'https://note.com/rabbitflower/rss';
const POSTS_DIR = path.join(process.cwd(), '_posts');
const AUTHOR = 'Rabbitflower';
const TAGS = 'note,blog';

const parser = new Parser({
  customFields: {
    item: [['content:encoded', 'contentEncoded']],
  },
});

const turndown = new TurndownService({ headingStyle: 'atx' });

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

async function main() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

  const feed = await parser.parseURL(NOTE_RSS_URL);
  const existingIds = getExistingNoteIds();
  let nextNum = nextNoteNumber();

  // 古い記事から順に処理（番号・並び順を投稿日順に保つため）
  const items = [...feed.items].reverse();

  let created = 0;

  for (const item of items) {
    const noteId = extractNoteId(item.link);
    if (!noteId) {
      console.log(`[skip] noteIDを取得できませんでした: ${item.link}`);
      continue;
    }
    if (existingIds.has(noteId)) {
      continue; // 既に取り込み済み
    }

    const html = item.contentEncoded || item.content || item.contentSnippet || '';
    const markdown = turndown.turndown(html).trim();

    const imgMatch = html.match(/<img[^>]+src="([^"]+)"/);
    const image = imgMatch ? imgMatch[1] : '';

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
  }

  console.log(`${created} 件の新しい記事を作成しました。`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
