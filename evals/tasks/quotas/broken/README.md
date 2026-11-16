# filestore

The metadata core of a small file-storage service: users on a plan (`free`, `pro`, `team`) and their files by path.
File content lives in object storage; this module keeps sizes and versions and enforces the rules.
Node.js 20+, standard library only, in memory.

```js
import { createStore } from './src/store.js';
const s = createStore();
const u = s.addUser({ name: 'Ana', plan: 'free' });   // 'u_1'
s.put(u, { path: '/docs/a.pdf', size: 52_000 });       // { path, size, version: 1 }
s.list(u, '/docs/');
s.summary(u);                                          // '1 file, 50.8 KiB'
s.setPlan(u, 'pro');
s.remove(u, '/docs/a.pdf');
```

- Paths start with `/`; segments use letters, digits, `_`, `.`, `-`; no `.` or `..` segments.
- `put` on an existing path overwrites it and bumps `version`.
- Errors are `StoreError` with a `code`: `invalid_input`, `not_found`. An unknown user is reported before bad input.

## Tests

```bash
node --test
```
