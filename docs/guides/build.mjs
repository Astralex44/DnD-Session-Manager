// Renders dm-guide.md and player-guide.md to PDF in the app's look.
// Usage: npm install && npm run build   (needs Google Chrome installed)
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const GUIDES = [
  { src: 'dm-guide.md', out: 'DM-Guide.pdf', kicker: 'Dungeon Master' },
  { src: 'player-guide.md', out: 'Player-Guide.pdf', kicker: 'Player' },
];
const CHROME = process.env.CHROME_PATH
  ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium']
    .find((p) => existsSync(p));
if (!CHROME) throw new Error('Chrome not found — set CHROME_PATH');

const asOf = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

async function toHtml({ src, kicker }) {
  const md = await readFile(path.join(here, src), 'utf8');
  // The first "# " line becomes the title band; the rest is the body.
  const [, title = 'Guide', rest = md] = md.match(/^# (.+)\n([\s\S]*)$/) ?? [];
  const body = marked.parse(rest).replace(/<table>/g, '<table class="content">');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${escape(title)}</title>
<link rel="stylesheet" href="${pathToFileURL(path.join(here, 'guide.css'))}">
</head><body>
<table class="page-frame"><thead><tr><td></td></tr></thead>
<tfoot><tr><td></td></tr></tfoot>
<tbody><tr><td>
<header class="masthead">
  <p class="kicker"><span class="glyph">⚔</span>DnD Session Manager</p>
  <h1>${escape(title.replace(/^.*— /, ''))}</h1>
  <p class="asof">As of ${asOf} · dnd.astralex.dev</p>
</header>
${body}
</td></tr></tbody></table>
</body></html>`;
}

const footer = (title) => `<div style="width:100%;font-family:Georgia,serif;font-size:8pt;color:#6B5D4A;
  padding:0 18mm 6mm;display:flex;justify-content:space-between;-webkit-print-color-adjust:exact">
  <span>${escape(title)}</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const g of GUIDES) {
    const html = await toHtml(g);
    const tmp = path.join(here, `.${g.src}.html`);
    await writeFile(tmp, html);
    const page = await browser.newPage();
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
    await page.pdf({
      path: path.join(here, g.out),
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: footer(`DnD Session Manager · ${g.kicker} guide`),
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    await page.close();
    console.log(`wrote ${g.out}`);
  }
} finally {
  await browser.close();
}
