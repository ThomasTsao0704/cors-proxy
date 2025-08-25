export default {
  async fetch(req) {
    const url = new URL(req.url);
    const target = url.searchParams.get('url');
    if (!target) return new Response('missing ?url=', { status: 400 });

    // ==== Auto-generated whitelist from CSV ====
    const allowedHosts = new Set([
      'openapi.twse.com.tw',
      'www.tpex.org.tw'
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

    if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
      return new Response('method not allowed', { status: 405 });
    }
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

    const upstreamResp = await fetch(parsedTarget.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
    });

    const headers = new Headers(upstreamResp.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Expose-Headers', headers.get('Access-Control-Expose-Headers') ?? '*');
    headers.delete('set-cookie');

    return new Response(await upstreamResp.arrayBuffer(), {
      status: upstreamResp.status,
      headers,
    });
  }
};
