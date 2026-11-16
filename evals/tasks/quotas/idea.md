Build `filestore`, the metadata core of a small file-storage service for freelancers. Node.js 20+, standard library only, a JavaScript module (no UI, no HTTP yet), in memory for now.

`src/store.js` exports `createStore()` and `StoreError` (with a `code`). The store holds users (`u_1`, `u_2`, ... with a name and a plan: `free`, `pro` or `team`) and each user's files by path (`/docs/a.pdf`), with size in bytes and a version that goes up on every overwrite. It can list files under a prefix, remove a file, change a user's plan, and print a one-line summary for the account page. File content lives in object storage; this module only keeps the metadata.

The work comes in phases (see the founder answers): phase 1, the core above; phase 2, per-user storage quotas; phase 3, the HTTP API.
