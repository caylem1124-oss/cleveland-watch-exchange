// Add CLE Watches listings (shard "cle") from a JSON file, newest first.
//   node tools/add-listings.cjs new-listings.json   then   node tools/enrich-catalog.cjs
// Each item: { id, brand, title, reference, size, price (number or null = "Price on request"),
//              summary, facts: ["Model: ...", "Dial color: ...", "Bracelet/strap: ...", ...],
//              image: Rolex code like "126610lv-0002" or a full official image URL,
//              box, papers, condition (optional, "" = confirm with us),
//              newArrival (optional, default true; false for watches sourced to order) }
// Only use an official image when reference, dial and bracelet match exactly.
const fs = require('fs'), path = require('path'), assert = require('assert');
const dir = path.join(__dirname, '..', 'docs', 'data');
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const load = t => { const window = { STP_DETAILS: {} }; new Function('window', t)(window); return window; };

const catText = read('catalog.js'), cat = load(catText), nl = catText.endsWith('\n') ? '\n' : '';
const ser = w => `window.STP_META=${JSON.stringify(w.STP_META)};window.STP_CATALOG=${JSON.stringify(w.STP_CATALOG)};window.STP_DETAILS={};`;
assert.strictEqual(ser(cat) + nl, catText, 'catalog.js has an unexpected layout');
const detText = read('details-cle.js'), det = load(detText).STP_DETAILS;
const dser = o => `Object.assign(window.STP_DETAILS,${JSON.stringify(o)});\n`;
assert.strictEqual(dser(det), detText, 'details-cle.js has an unexpected layout');

const items = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const have = new Set(cat.STP_CATALOG.map(p => p.id)), today = new Date().toISOString().slice(0, 10);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rolex = [], official = [], added = [];
for (const it of items) {
  assert(it.id && it.brand && it.title && it.reference, 'id, brand, title and reference are required: ' + JSON.stringify(it));
  assert(it.price === null || (Number.isFinite(it.price) && it.price > 0), 'bad price for ' + it.id);
  if (have.has(it.id)) { console.log('skip (already listed):', it.id); continue; }
  added.push({ id: it.id, newArrival: it.newArrival !== false, title: it.title, brand: it.brand, price: it.price, request: it.price === null, available: null,
    image: '', handle: slug(it.title), shard: 'cle', size: String(it.size || ''), condition: it.condition || '', sku: '', reference: it.reference,
    box: it.box || '', papers: it.papers || '', cellini: false, popular: false, importedSource: false, reviewHold: false, referenceDocumented: true });
  det[it.id] = { id: it.id, reference: it.reference, summary: it.summary || '', facts: it.facts || [], tags: [], images: [], variants: [],
    source: '', sourceName: '', imported: today, referenceDocumented: true, referenceSources: [] };
  if (it.image) (/^https?:/.test(it.image) ? official : rolex).push(`${it.id}\t${it.image}\n`);
  const m = cat.STP_META; m.products++; m.recordCount++; m.retrievedProducts++; m.brands[it.brand] = (m.brands[it.brand] || 0) + 1;
  have.add(it.id);
}
cat.STP_CATALOG.unshift(...added);
fs.writeFileSync(path.join(dir, 'catalog.js'), ser(cat) + nl);
fs.writeFileSync(path.join(dir, 'details-cle.js'), dser(det));
if (rolex.length) fs.appendFileSync(path.join(__dirname, 'rolex-renders.tsv'), rolex.join(''));
if (official.length) fs.appendFileSync(path.join(__dirname, 'official-images.tsv'), official.join(''));
console.log(`added ${added.length} listings (${rolex.length} Rolex images, ${official.length} other official images). Now run: node tools/enrich-catalog.cjs`);
