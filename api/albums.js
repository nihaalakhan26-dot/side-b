// Finds cover art for the real albums on the shop's shelves, using Apple's iTunes catalogue (India store).
// The answer is cached for a week, so Apple sees about one round of lookups a week, not one per visitor.
const SHELF = [
  ['Ariana Grande', ['Positions', 'Sweetener', 'thank u, next', 'eternal sunshine']],
  ['Tame Impala', ['Currents', 'Lonerism', 'The Slow Rush', 'InnerSpeaker']],
  ['The Beatles', ['Abbey Road', 'Revolver', 'Rubber Soul', 'Let It Be', "Sgt. Pepper's Lonely Hearts Club Band"]],
  ['Mac Miller', ['Swimming', 'Circles', 'The Divine Feminine', 'Faces']],
  ['Sade', ['Diamond Life', 'Love Deluxe', 'Promise', 'Lovers Rock']],
  ['Frank Ocean', ['Blonde', 'channel ORANGE']],
  ['Amy Winehouse', ['Back to Black', 'Frank']],
  ['Fleetwood Mac', ['Rumours']],
  ['Pink Floyd', ['The Dark Side of the Moon']],
  ['Michael Jackson', ['Thriller', 'Off the Wall']],
  ['The Weeknd', ['Starboy', 'After Hours']],
  ['Kendrick Lamar', ['good kid, m.A.A.d city', 'To Pimp a Butterfly']],
  ['SZA', ['SOS', 'Ctrl']],
  ['Daft Punk', ['Random Access Memories', 'Discovery']],
  ['Arctic Monkeys', ['AM']],
  ['Radiohead', ['In Rainbows', 'OK Computer']],
  ['Stevie Wonder', ['Songs in the Key of Life']],
  ['Marvin Gaye', ["What's Going On"]],
  ['Prince', ['Purple Rain']],
  ['Billie Eilish', ['Happier Than Ever']],
  ['Harry Styles', ["Harry's House", 'Fine Line']],
  ['Lana Del Rey', ['Born to Die']],
  ['Tyler, The Creator', ['IGOR', 'Flower Boy']],
  ['Taylor Swift', ['folklore']],
  ['Childish Gambino', ['Awaken, My Love!']],
  ['Steve Lacy', ['Gemini Rights']],
  ['Daniel Caesar', ['Freudian']],
  ['Queen', ['A Night at the Opera']],
  ['David Bowie', ['The Rise and Fall of Ziggy Stardust and the Spiders from Mars']],
  ['Nirvana', ['Nevermind']],
  ['Lauryn Hill', ['The Miseducation of Lauryn Hill']],
  ['Norah Jones', ['Come Away With Me']],
  ['Gorillaz', ['Demon Days']],
  ['Beach House', ['Bloom']],
  ['The Strokes', ['Is This It']],
  ['Dua Lipa', ['Future Nostalgia']],
  ['Erykah Badu', ['Baduizm']],
  ['Bob Marley & The Wailers', ['Legend']],
  ['Mac DeMarco', ['Salad Days']],
  ['Kali Uchis', ['Isolation']],
  ['Phoebe Bridgers', ['Punisher']],
  ['Doja Cat', ['Planet Her']],
  ['Coldplay', ['Parachutes']],
  ['Bon Iver', ['For Emma, Forever Ago']],
  ['Prateek Kuhad', ['cold/mess']],
];

// "Abbey Road (Remastered)" and "abbey road" should match, so drop brackets, punctuation and case
const norm = s => String(s || '').toLowerCase().replace(/\s*[([].*?[)\]]/g, '').replace(/\s+-\s+(ep|single)$/, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

async function lookupArtist(artist, titles) {
  const url = 'https://itunes.apple.com/search?' + new URLSearchParams({
    term: artist, entity: 'album', attribute: 'artistTerm', limit: '200', country: 'IN', media: 'music'
  });
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 5000);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'side-b-records' }, signal: ctl.signal });
    if (!r.ok) return [];
    const data = await r.json(), want = norm(artist);
    const mine = (data.results || []).filter(c => c.collectionName && c.artworkUrl100 && norm(c.artistName).includes(want) && !/ - single$/i.test(c.collectionName));
    return titles.map(t => {
      const n = norm(t);
      // the plain release beats deluxe, live and anniversary editions, which often have different covers
      const extra = c => /deluxe|edition|anniversary|expanded|live|version/i.test(c.collectionName) ? 1 : 0;
      const exact = mine.filter(c => norm(c.collectionName) === n), loose = mine.filter(c => norm(c.collectionName).startsWith(n));
      const pick = (exact.length ? exact : loose).sort((a, b) => extra(a) - extra(b) || (b.trackCount || 0) - (a.trackCount || 0))[0];
      return pick ? { t, a: artist, art: pick.artworkUrl100.replace('100x100bb', '400x400bb'), url: pick.collectionViewUrl || '' } : null;
    }).filter(Boolean);
  } catch (e) {
    return [];
  } finally {
    clearTimeout(to);
  }
}

module.exports = async (req, res) => {
  const found = [], queue = SHELF.slice();
  // a few at a time, so Apple isn't hit with every request at once
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) { const [artist, titles] = queue.shift(); found.push(...await lookupArtist(artist, titles)); }
  }));
  const order = SHELF.flatMap(([a, ts]) => ts.map(t => a + '|' + t));
  found.sort((x, y) => order.indexOf(x.a + '|' + x.t) - order.indexOf(y.a + '|' + y.t));
  // only keep a good answer for long; a patchy one is retried soon
  const good = found.length >= order.length * 0.6;
  res.setHeader('Cache-Control', good ? 's-maxage=604800, stale-while-revalidate=2592000' : 's-maxage=300');
  res.status(found.length ? 200 : 502).json({ albums: found });
};
