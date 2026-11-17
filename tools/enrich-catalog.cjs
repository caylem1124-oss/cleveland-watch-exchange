// Fill docs/data/catalog.js fields used by the collection page:
//  - model, dial, bracelet: copied from each listing's facts in docs/data/details-*.js (for the filters)
//  - render: the brand's official product image, from
//      tools/rolex-renders.tsv     "<listing id><TAB><reference>-<variant>", e.g. "luv-8862141	126610ln-0001"
//      tools/official-images.tsv   "<listing id><TAB><full image URL>" for other brands (Cartier, Omega, ...)
//    Only add a line when the reference, dial AND bracelet match the watch exactly.
// Run after adding or editing listings:  node tools/enrich-catalog.cjs
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'docs', 'data');
const load = f => { const window = { STP_DETAILS: {} }; new Function('window', fs.readFileSync(path.join(dir, f), 'utf8'))(window); return window; };
const ROLEX = v => `https://media.rolex.com/image/upload/q_auto/f_auto/c_limit,w_1200/v1/catalogue/2026/upright-c/m${v.toLowerCase()}`;

const catFile = path.join(dir, 'catalog.js'), text = fs.readFileSync(catFile, 'utf8');
const cat = load('catalog.js');
const ser = w => `window.STP_META=${JSON.stringify(w.STP_META)};window.STP_CATALOG=${JSON.stringify(w.STP_CATALOG)};window.STP_DETAILS={};`;
const nl = text.endsWith('\n') ? '\n' : '';
if (ser(cat) + nl !== text) throw new Error('catalog.js has an unexpected layout; not rewriting it');

const details = {};
for (const f of fs.readdirSync(dir).filter(f => /^details-.*\.js$/.test(f))) Object.assign(details, load(f).STP_DETAILS);
const fact = (d, key) => { const f = (d.facts || []).find(x => x.toLowerCase().startsWith(key.toLowerCase() + ':')); return f ? f.slice(f.indexOf(':') + 1).trim() : ''; };
const tsv = f => fs.readFileSync(path.join(__dirname, f), 'utf8').split(/\r?\n/)
  .filter(l => l.trim() && !l.startsWith('#')).map(l => l.split('\t').map(s => s.trim()));
const renders = new Map([...tsv('rolex-renders.tsv').map(([id, v]) => [id, ROLEX(v)]), ...tsv('official-images.tsv')]);

let n = 0, r = 0;
for (const p of cat.STP_CATALOG) {
  const d = details[p.id];
  if (d) {
    const add = { model: fact(d, 'Model'), dial: fact(d, 'Dial color'), bracelet: fact(d, 'Bracelet/strap') };
    for (const [k, v] of Object.entries(add)) if (v) { p[k] = v; n++; }
  }
  if (renders.has(p.id)) { p.render = renders.get(p.id); r++; } else delete p.render;
}
fs.writeFileSync(catFile, ser(cat) + nl);
console.log(`catalog.js: set ${n} fields and ${r} official images on ${cat.STP_CATALOG.length} listings`);
