(function(root){
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

// Facets derived from the listing's own data (title prefix, condition, dial/bracelet/model facts).
const CONDITIONS={'unworn':'Unworn','new':'Unworn','slider':'Slider','retail ready':'Retail Ready','pre-owned':'Pre-Owned','preowned':'Pre-Owned','vintage':'Vintage'};
function condition(p){const m=/^\(([^)]+)\)/.exec(p.title||'');const raw=norm(m?m[1]:p.condition).trim();return CONDITIONS[raw]||(raw?raw.replace(/\b\w/g,c=>c.toUpperCase()):'')}
const DIALS=[['Diamonds',/diamond|baguette|pave|pavé/],['Mother of pearl',/mother|pearl|\bmop\b/],['Skeleton',/skeleton/],['Black',/black|blak|onyx/],['Blue',/blue/],['Green',/green|mint|olive/],['Grey/Slate',/grey|gray|slate|wimbledon|rhodium/],['Pink/Rose',/pink|rose|sundust|salmon|copper/],['Brown',/chocolate|brown/],['Champagne/Gold',/champagne|gold|yellow/],['White/Silver',/white|silver|ivory|platinum|cream/]];
function dialGroup(p){const d=norm(p.dial);if(!d)return '';for(const [g,re] of DIALS)if(re.test(d))return g;return 'Other'}
const STRAPS=[['Oysterflex',/oysterflex/],['Jubilee',/jubilee/],['President',/president/],['Oyster',/oyster/],['Leather strap',/leather|alligator|croc/],['Rubber strap',/rubber/],['Fabric strap',/satin|fabric|nato|textile/],['Metal bracelet',/steel|gold|titanium|platinum|metal|bracelet/]];
function strapGroup(p){const b=norm(p.bracelet);if(!b)return '';for(const [g,re] of STRAPS)if(re.test(b))return g;return 'Other'}
// one spelling per model, whatever the source wrote (DayDate, Day-Date, LADY DATE JUST, La Dona …)
const MODELS={daydate:'Day-Date',oysterperpetual:'Oyster Perpetual',ballonbleu:'Ballon Bleu',ladydatejust:'Lady-Datejust',oysterdate:'Oysterdate',precision:'Precision',yachtmaster:'Yacht-Master',yachtmasterii:'Yacht-Master II',ladona:'La Doña',panthere:'Panthère',delices:'Délices',gmtmasterii:'GMT-Master II',skydweller:'Sky-Dweller',seadweller:'Sea-Dweller',datejust:'Datejust',daytona:'Daytona',submariner:'Submariner'};
function model(p){const m=String(p.model||'').trim();if(!m)return '';return MODELS[norm(m).replace(/[^a-z0-9]/g,'')]||(m===m.toUpperCase()?m.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()):m)}
const facets={condition,dial:dialGroup,strap:strapGroup,model};

function filter(products,state,skip){
  const terms=norm(state.search).split(/\s+/).filter(Boolean),has=(k,v)=>k!==skip&&state[k]&&state[k].length&&!state[k].includes(v);
  let result=products.filter(p=>{
    if(p.reviewHold)return false;if(state.collection==='popular'&&!p.popular)return false;if(state.collection==='cellini'&&!p.cellini)return false;
    if(skip!=='brands'&&state.brands.length&&!state.brands.includes(p.brand))return false;
    if(state.availability==='available'&&!p.available)return false;if(state.availability==='unavailable'&&p.available!==false)return false;
    if(p.request&&!state.showRequest)return false;
    if(!p.request&&((state.min!==''&&p.price<Number(state.min))||(state.max!==''&&p.price>Number(state.max))))return false;
    if(state.size){const s=Number(p.size);if(!s)return false;if(state.size==='small'&&s>=36)return false;if(state.size==='medium'&&(s<36||s>40))return false;if(state.size==='large'&&s<=40)return false}
    if(has('conds',condition(p))||has('dials',dialGroup(p))||has('straps',strapGroup(p))||has('models',model(p)))return false;
    if(state.papers&&p.papers!=='Yes')return false;
    return terms.every(t=>norm(p.title+' '+p.sku+' '+p.brand+' '+(p.reference||'')+' '+(p.dial||'')+' '+model(p)).includes(t))});
  if(state.sort==='low')result.sort((a,b)=>(a.request?Infinity:a.price)-(b.request?Infinity:b.price));
  if(state.sort==='high')result.sort((a,b)=>(b.request?-Infinity:b.price)-(a.request?-Infinity:a.price));
  if(state.sort==='newest')result.sort((a,b)=>(b.newArrival?1:0)-(a.newArrival?1:0));
  if(state.sort==='az')result.sort((a,b)=>a.title.localeCompare(b.title));
  if(state.sort==='za')result.sort((a,b)=>b.title.localeCompare(a.title));
  return result}
// counts for one facet, over the listings that match every *other* active filter
function counts(products,state,key,fn){const out=new Map();for(const p of filter(products,state,key)){const v=fn(p);if(v)out.set(v,(out.get(v)||0)+1)}return out}
function pageNumbers(page,total){return [...new Set([1,total,page-1,page,page+1].filter(n=>n>=1&&n<=total))].sort((a,b)=>a-b)}
const api={filter,counts,pageNumbers,norm,facets};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CatalogCore=api})(typeof window==='undefined'?globalThis:window);
