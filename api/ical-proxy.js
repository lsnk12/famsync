export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing calendar URL' });
  }

  try {
    const targetUrl = url.replace('webcal://', 'https://').replace('webcals://', 'https://');
    
    // Server-side fetch direct to Apple CalDAV
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream server returned status ${response.status}`);
    }

    const icsText = await response.text();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    return res.status(200).send(icsText);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}