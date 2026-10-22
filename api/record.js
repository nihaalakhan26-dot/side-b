// Short links for finished records, stored in Upstash Redis for 30 days.
//   POST /api/record            saves a record and answers { id }
//   GET  /api/record?id=x&json  answers { c } (the packed record) for the page to open
//   GET  /api/record?id=x&img   the sleeve picture, for link previews
//   GET  /r/x                   (rewritten to /api/record?id=x) the site, with a link preview of the record
// Vercel's Upstash integration sets KV_REST_API_URL and KV_REST_API_TOKEN (older setups use UPSTASH_REDIS_REST_*).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const TTL = 60 * 60 * 24 * 30;      // records last 30 days
const PER_HOUR = 20;                // records one person can press in an hour
const ID = /^[A-Za-z0-9]{8}$/;

async function redis(...cmd) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.error) throw new Error(data.error || 'Upstash ' + r.status);
  return data.result;
}
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (v, n) => String(v || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n);
const newId = () => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789', b = crypto.randomBytes(8); return Array.from(b, x => a[x % a.length]).join(''); };

async function save(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const c = String(body.c || ''), t = String(body.t || '');
  if (!/^[zp][A-Za-z0-9_-]{10,}$/.test(c) || c.length > 150000) return res.status(400).json({ error: 'That record could not be read.' });
  if (t && (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(t) || t.length > 60000)) return res.status(400).json({ error: 'That sleeve picture could not be read.' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const hourKey = `rl:${ip}:${Math.floor(Date.now() / 3600000)}`;
  const n = await redis('INCR', hourKey);
  if (n === 1) await redis('EXPIRE', hourKey, 3600);
  if (n > PER_HOUR) return res.status(429).json({ error: 'That is a lot of records for one hour. Try again in a little while.' });
  const rec = JSON.stringify({ c, t, name: clean(body.name, 80), by: clean(body.by, 60), to: clean(body.to, 60) });
  for (let i = 0; i < 5; i++) {
    const id = newId();
    if (await redis('SET', 'rec:' + id, rec, 'EX', TTL, 'NX')) return res.status(200).json({ id, days: TTL / 86400 });
  }
  throw new Error('No free id');
}

async function load(id) {
  const raw = await redis('GET', 'rec:' + id);
  return raw ? JSON.parse(raw) : null;
}

let page = null;
function sitePage() {
  if (!page) page = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  return page;
}

module.exports = async (req, res) => {
  try {
    if (!URL_ || !TOKEN) return res.status(503).json({ error: 'Record storage is not set up.' });
    if (req.method === 'POST') return await save(req, res);
    const q = req.query || {}, id = String(q.id || '');
    if (!ID.test(id)) return res.status(404).json({ error: 'No such record.' });
    const rec = await load(id);
    if ('json' in q) {
      if (!rec) return res.status(404).json({ error: 'gone' });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ c: rec.c });
    }
    if ('img' in q) {
      if (!rec || !rec.t) return res.status(404).end();
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(200).send(Buffer.from(rec.t.split(',')[1], 'base64'));
    }
    // the page itself, with a preview card for WhatsApp, iMessage and the rest
    const host = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
    const title = rec ? (rec.by ? `${rec.by} pressed you a record` : 'Someone pressed you a record') : 'Side B';
    const desc = rec ? (rec.name ? `"${rec.name}". Open the bag and play it.` : 'Open the bag and play it.') : 'Make a record for someone.';
    let meta = `<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${esc(host + '/r/' + id)}">`;
    if (rec && rec.t) meta += `<meta property="og:image" content="${esc(host + '/api/record?id=' + id + '&img')}"><meta name="twitter:card" content="summary_large_image">`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(sitePage().replace('</head>', meta + '\n</head>'));
  } catch (e) {
    return res.status(502).json({ error: 'Record storage is not answering right now.' });
  }
};
