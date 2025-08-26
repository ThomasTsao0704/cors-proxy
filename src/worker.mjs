export default {
  async fetch(req) {
    const url = new URL(req.url);
    const target = url.searchParams.get('url');
    if (!target) return new Response('missing ?url=', { status: 400 });

    // Whitelist (add hosts here as needed)
    const allowedHosts = new Set([
      'openapi.twse.com.tw',
      'www.tpex.org.tw',
    ]);

    let parsedTarget;
    try { parsedTarget = new URL(target); }
    catch { return new Response('invalid url', { status: 400 }); }

    if (!/^https?:$/.test(parsedTarget.protocol)) {
      return new Response('only http/https', { status: 400 });
    }
    if (!allowedHosts.has(parsedTarget.hostname)) {
      return new Response('forbidden host', { status: 403 });
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    if (!['GET','HEAD'].includes(req.method)) {
      return new Response('method not allowed', { status: 405 });
    }

    const upstreamResp = await fetch(parsedTarget.toString(), {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const headers = new Headers(upstreamResp.headers);

    // --- CORS ---
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Expose-Headers', headers.get('Access-Control-Expose-Headers') ?? '*');

    // --- Avoid cookie set in cross-origin fetches ---
    headers.delete('set-cookie');

    // --- Force inline display for JSON or when upstream asked for attachment ---
    const ct = (headers.get('content-type') || '').toLowerCase();
    const cd = (headers.get('content-disposition') || '').toLowerCase();

    // If upstream tries to download, change to inline
    if (cd.includes('attachment')) {
      headers.set('content-disposition', 'inline');
    }

    // If content-type looks like JSON (or missing but URL ends with .json), set JSON CT and inline
    const isLikelyJSON = ct.includes('application/json') || /\.json(\?|$)/i.test(parsedTarget.pathname);
    if (isLikelyJSON) {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('content-disposition', 'inline');
      headers.set('X-Content-Type-Options', 'nosniff');
    }

    const body = await upstreamResp.arrayBuffer();
    return new Response(body, {
      status: upstreamResp.status,
      headers,
    });
  }
};
