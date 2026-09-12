name: Repair note articles (one-time)

on:
  workflow_dispatch: {}

permissions:
  contents: write

jobs:
  repair:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install cheerio turndown

      - name: Run repair script
        run: node scripts/note-repair.mjs

      - name: Commit and push if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add _posts
          git diff --cached --quiet || git commit -m "note記事の本文・サムネイルを修復"
          git push
