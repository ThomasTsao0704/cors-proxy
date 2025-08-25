# cors-proxy quick README

## Your Worker
- **URL**: https://cors-proxy.s01yg3642.workers.dev/

## Quick Curl Test
curl "https://cors-proxy.s01yg3642.workers.dev/?url=https%3A%2F%2Fopenapi.twse.com.tw%2Fv1%2FexchangeReport%2FMI_INDEX" -i

## Use in Browser
- Open `demo.html` and try the built-in buttons.
- If you see `Access-Control-Allow-Origin: *` and `200`, CORS is solved.

## Notes
- Whitelist hosts are enforced inside `src/worker.mjs`.
- To allow more hosts, add them to `allowedHosts` and redeploy.
