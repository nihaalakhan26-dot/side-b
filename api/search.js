// Searches Apple's iTunes catalogue (India store) for songs.
// The browser can't call Apple directly, so the site calls this instead.
module.exports = async (req, res) => {
  // ?album=<collectionId>: that album's songs in their running order (disc, then track number)
  const album = String((req.query && req.query.album) || '').replace(/\D/g, '').slice(0, 15);
  if (album){
    try {
      const r = await fetch('https://itunes.apple.com/lookup?' + new URLSearchParams({ id: album, entity: 'song', country: 'IN', limit: '60' }), { headers: { 'User-Agent': 'side-b-records' } });
      if (!r.ok) throw new Error('Apple lookup failed: ' + r.status);
      const data = await r.json(), all = data.results || [], col = all.find(t => t.wrapperType === 'collection') || {};
      const results = all.filter(t => t.wrapperType === 'track' && t.kind === 'song')
        .sort((a, b) => (a.discNumber || 1) - (b.discNumber || 1) || (a.trackNumber || 0) - (b.trackNumber || 0))
        .map(t => ({ trackId: t.trackId, collectionId: t.collectionId, trackName: t.trackName, trackNumber: t.trackNumber, previewUrl: t.previewUrl, trackViewUrl: t.trackViewUrl }));
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
      res.status(200).json({ results, releaseDate: col.releaseDate || '', collectionViewUrl: col.collectionViewUrl || '' });
    } catch (e) { res.status(502).json({ results: [], error: 'Search is unavailable right now.' }); }
    return;
  }
  const q = String((req.query && req.query.q) || '').trim().slice(0, 100);
  if (!q) { res.status(200).json({ results: [] }); return; }
  const url = 'https://itunes.apple.com/search?' + new URLSearchParams({
    term: q, entity: 'song', limit: '30', country: 'IN', media: 'music'
  });
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'side-b-records' } });
    if (!r.ok) throw new Error('Apple search failed: ' + r.status);
    const data = await r.json();
    const results = (data.results || []).map(t => ({
      trackId: t.trackId, collectionId: t.collectionId, trackName: t.trackName, artistName: t.artistName, collectionName: t.collectionName,
      artworkUrl100: t.artworkUrl100, previewUrl: t.previewUrl, trackViewUrl: t.trackViewUrl, releaseDate: t.releaseDate
    }));
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ results });
  } catch (e) {
    res.status(502).json({ results: [], error: 'Search is unavailable right now.' });
  }
};
