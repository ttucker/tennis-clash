import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEARS_URLS = JSON.parse(fs.readFileSync(path.join(__dirname, 'gears_urls.json'), 'utf8'));

async function fetchPageHtml(title) {
  const api = `https://tennis-clash.fandom.com/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&prop=text&redirects=1`;
  const res = await fetch(api, { headers: { 'User-Agent': 'TennisClashScraper/1.0' } });
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
  const j = await res.json();
  if (!j.parse || !j.parse.text || !j.parse.text['*']) throw new Error('No parse text');
  return { title: j.parse.title, html: j.parse.text['*'] };
}

const read_row = (cells, skills = false) => {
  const rowData = [];
  cells.forEach((cell, i) => {
    let text = cell.textContent.trim();
    if (skills) text = i ? +text || 0 : text;
    rowData.push(text);
  });
  return rowData;
};

async function get_and_parse_api(url) {
  const title = url.split('/').pop();
  console.log('Fetching API for ', title);
  const { html, title: parsedTitle } = await fetchPageHtml(title);
  const document = new JSDOM(html).window.document;

  const item = {
    url,
    name: parsedTitle || document.querySelector('#firstHeading')?.textContent?.trim() || null,
    // intentionally NOT including `foundIn` or `rarity` — application ignores these
    imageUrl: document.querySelector('.image')?.href?.replace('static.', 'vignette.') || null,
    upgrade: {},
    skills: {}
  };

  const tables = [
    { tableId: 'Upgrade_Table', rowSelector: 'tr:nth-child(2)', itemProperty: 'upgrade' },
    { tableId: 'Upgrade_Table', rowSelector: 'tr:nth-child(3)', itemProperty: 'upgrade' },
    { tableId: 'Skills_Table', rowSelector: 'tr:nth-child(n+2):nth-child(-n+7)', itemProperty: 'skills' }
  ];

  tables.forEach((table) => {
    const { tableId, rowSelector, itemProperty } = table;
    const tableData = document.getElementById(tableId)?.parentElement?.nextElementSibling;
    if (tableData) {
      const rows = tableData.querySelectorAll(rowSelector);
      rows.forEach(row => {
        const rowData = read_row(Array.from(row.querySelectorAll('td')), itemProperty === 'skills');
        const key = rowData.shift();
        item[itemProperty][key] = rowData;
      });
    }
  });

  return item;
}

(async () => {
  // Using embedded `GEARS_URLS` (static list); no Category API lookup.
  const GEARS = {};
  for (const [category, urls] of Object.entries(GEARS_URLS)) {
    const items = GEARS[category] = [];
    for (const url of urls) {
      for (let nTry = 0; ; nTry++) {
        try {
          items.push(await get_and_parse_api(url));
          break;
        } catch (e) {
          if (nTry > 3) {
            console.warn('Failed after retries:', url, e.message);
            items.push({ url, name: null, imageUrl: null, upgrade: {}, skills: {} });
            break;
          }
          console.warn('API retry', nTry, url, e.message);
          await new Promise(r => setTimeout(r, 500 * (nTry + 1)));
        }
      }
      await new Promise(r => setTimeout(r, 250));
    }
  }

  const outPath = path.join(__dirname, '..', 'src', 'app', 'gears.ts');
  const tmpPath = outPath + '.tmp';
  const fileContent = 'export const GEARS = ' + JSON.stringify(GEARS, null, 2) + ';';
  fs.writeFileSync(tmpPath, fileContent);
  fs.renameSync(tmpPath, outPath);
  console.log('Wrote', outPath);
})();
