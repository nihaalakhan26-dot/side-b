// Searches Apple's iTunes catalogue (India store) for songs.
// The browser can't call Apple directly, so the site calls this instead.
module.exports = async (req, res) => {
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
      trackId: t.trackId, trackName: t.trackName, artistName: t.artistName, collectionName: t.collectionName,
      artworkUrl100: t.artworkUrl100, previewUrl: t.previewUrl, trackViewUrl: t.trackViewUrl
    }));
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ results });
  } catch (e) {
    res.status(502).json({ results: [], error: 'Search is unavailable right now.' });
  }
};
