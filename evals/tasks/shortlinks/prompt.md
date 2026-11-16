Build `shortlinks`, a small URL-shortener HTTP service.

Constraints: Node.js 20 or later, standard library only (`node:http`, no npm dependencies, no frameworks). Storage is in memory. `src/server.js` must export `createServer(options)` that returns a `node:http` Server that is not yet listening; `options.now` is an optional function returning the current time in milliseconds (default `Date.now`). A `node src/main.js` entry point listens on `PORT` (default 3000).

API (JSON in and out; every error body is `{"error":"<code>"}`):
- `POST /links` with body `{"url": "...", "code": "..."}` (`code` optional). `url` must be an absolute `http` or `https` URL of at most 2048 characters, else 400 `invalid_url`. A custom `code` is 4 to 16 characters from `A-Z a-z 0-9 _ -`, else 400 `invalid_code`; if already used, 409 `code_taken`. Without a code, generate a random 7-character code from `A-Z a-z 0-9`. Response 201 `{"code": "...", "url": "..."}`. A body that is not valid JSON is 400 `invalid_json`.
- `GET /<code>`: 302 redirect with `Location` set to the url, and count one hit. Unknown code: 404 `not_found`.
- `GET /links/<code>`: 200 `{"code","url","hits","createdAt"}` with `createdAt` as an ISO 8601 string. Unknown: 404 `not_found`.
- `DELETE /links/<code>`: 204 with no body. Unknown: 404 `not_found`.
- Any other path is 404 `not_found`; a known path with the wrong method is 405 `method_not_allowed`.
- Rate limit: each client IP address may create at most 5 links in any rolling 60-second window. The sixth is 429 `rate_limited` with a `Retry-After` header: whole seconds until a slot frees, at least 1.

Also write your own tests (runnable with `node --test`) and a README that says how to run the service and the tests.
