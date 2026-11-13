// Saves the real cover of every album on the shop's shelves (the list in api/albums.js) into img/covers/, small enough
// for the shelves, and writes the list into index.html. The shelves then show real covers from the first moment,
// served from the site itself, instead of waiting on Apple.
//
// Run it again after changing the list in api/albums.js:   node scripts/fetch-covers.js
// It needs to reach itunes.apple.com and Apple's artwork servers (is1-ssl to is5-ssl.mzstatic.com).
const fs = require('fs'), path = require('path');
const { SHELF, lookupArtist } = require('../api/albums.js');

const ROOT = path.join(__dirname, '..'), DIR = path.join(ROOT, 'img', 'covers'), SIZE = 200;
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const norm = s => String(s || '').toLowerCase().replace(/\s*[([].*?[)\]]/g, '').replace(/\s+-\s+(ep|single)$/, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
async function findAlbum(artist, title, country){
  try {
    const r = await fetch('https://itunes.apple.com/search?' + new URLSearchParams({ term: artist + ' ' + title, entity: 'album', limit: '25', country, media: 'music' }));
    if (!r.ok) return null;
    const res = ((await r.json()).results || []).filter(c => c.artworkUrl100 && norm(c.artistName).includes(norm(artist).split(' ')[0]) && norm(c.collectionName).startsWith(norm(title)));
    const plain = c => /deluxe|edition|anniversary|expanded|live|version/i.test(c.collectionName) ? 1 : 0;
    const c = res.sort((a, b) => plain(a) - plain(b))[0];
    return c ? { t: title, a: artist, art: c.artworkUrl100, url: c.collectionViewUrl || '' } : null;
  } catch (e){ return null; }
}

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const found = [], queue = SHELF.slice();
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length){ const [artist, titles] = queue.shift(); found.push(...await lookupArtist(artist, titles)); }
  }));
  const order = SHELF.flatMap(([a, ts]) => ts.map(t => a + '|' + t));
  // a search by artist alone can miss an album behind dozens of singles, so look the rest up by name, in India then the US
  for (const k of order.filter(k => !found.some(f => f.a + '|' + f.t === k))){
    const [artist, title] = k.split('|'); let hit = null;
    for (const country of ['IN', 'US']){ hit = await findAlbum(artist, title, country); if (hit) break; }
    if (hit) found.push(hit);
  }
  found.sort((x, y) => order.indexOf(x.a + '|' + x.t) - order.indexOf(y.a + '|' + y.t));

  const list = [], keep = new Set();
  for (const al of found){
    // Apple resizes on its side: ask for the cover at the size the shelves need
    const src = al.art.replace(/\/\d+x\d+bb\.(jpg|png|webp)$/i, `/${SIZE}x${SIZE}bb.jpg`), name = slug(al.a + ' ' + al.t) + '.jpg';
    try {
      const r = await fetch(src); if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer()); if (buf.length < 2000) throw new Error('too small');
      fs.writeFileSync(path.join(DIR, name), buf); keep.add(name);
      list.push({ t: al.t, a: al.a, img: 'img/covers/' + name, url: al.url });
      console.log('saved', name, Math.round(buf.length/1024) + ' KB');
    } catch (e){ console.log('skipped', al.a, '-', al.t, '(' + e.message + ')'); }
  }
  const missing = order.filter(k => !list.some(a => a.a + '|' + a.t === k));
  if (list.length < order.length*0.6){ console.error(`Only ${list.length} of ${order.length} covers found. Not changing the site.`); process.exit(1); }
  for (const f of fs.readdirSync(DIR)) if (!keep.has(f)) fs.unlinkSync(path.join(DIR, f));

  const html = path.join(ROOT, 'index.html'), src = fs.readFileSync(html, 'utf8'), re = /\/\*SHELF\*\/[\s\S]*?\/\*SHELF_END\*\//;
  if (!re.test(src)){ console.error('No /*SHELF*/ marker in index.html'); process.exit(1); }
  fs.writeFileSync(html, src.replace(re, () => '/*SHELF*/' + JSON.stringify(list) + '/*SHELF_END*/'));
  console.log(`\n${list.length} of ${order.length} covers saved.` + (missing.length ? ' Not found: ' + missing.join(', ') : ''));
})();
