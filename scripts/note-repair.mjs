import TurndownService from 'turndown';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// ==== 設定 ====
const POSTS_DIR = path.join(process.cwd(), '_posts');
const UA = 'Mozilla/5.0 (compatible; note-sync-bot/1.0)';

const BODY_SELECTORS = [
  '.note-common-styles__textnote-body',
  'div[class*="note-common-styles__textnote-body"]',
];

const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

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

function parseFrontMatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2] };
}

async function main() {
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  let fixed = 0;
  let failed = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFrontMatter(content);
    if (!parsed) {
      skipped += 1;
      continue;
    }

    const urlMatch = parsed.fm.match(/^note_url:\s*(\S+)/m);
    if (!urlMatch) {
      skipped += 1; // note記事以外のファイルはスキップ
      continue;
    }
    const noteUrl = urlMatch[1];

    console.log(`[fetch] ${file} -> ${noteUrl}`);
    let html;
    try {
      const res = await fetch(noteUrl, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`status ${res.status}`);
      html = await res.text();
    } catch (err) {
      console.error(`[error] ${file}: ${err.message}`);
      failed += 1;
      continue;
    }

    const $ = cheerio.load(html);
    const image = extractThumbnail($);
    const bodyHtml = extractBodyHtml($);

    if (!bodyHtml) {
      console.warn(`[warn] 本文を取得できませんでした（スキップ）: ${file}`);
      failed += 1;
      continue;
    }

    const markdown = turndown.turndown(bodyHtml).trim();

    // image: 行を更新（無ければ追加）
    let newFm = parsed.fm;
    if (/^image:.*$/m.test(newFm)) {
      newFm = newFm.replace(/^image:.*$/m, `image: ${image}`);
    } else {
      newFm += `\nimage: ${image}`;
    }

    const newBody = `${markdown}\n\n[元記事はこちら](${noteUrl})\n`;
    const newContent = `---\n${newFm}\n---\n${newBody}`;

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`[fixed] ${file}`);
    fixed += 1;

    // note側への配慮として少し間隔をあける
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`修復: ${fixed}件 / 失敗: ${failed}件 / スキップ: ${skipped}件`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
