/** Vercel serverless health check — GET /api/health */
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  const body = {
    ok: true,
    service: 'go-trade',
    version: '9.1.0',
    time: new Date().toISOString(),
    uptime: process.uptime ? process.uptime() : null,
  };
  res.status(200).json(body);
};
