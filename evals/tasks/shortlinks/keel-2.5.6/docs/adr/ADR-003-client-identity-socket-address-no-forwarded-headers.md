# ADR-003 — Client identity — socket peer address, forwarded headers ignored

| | |
|---|---|
| **Status** | Proposed 2026-11-16 — `[ASSUMPTION]` (A-02); implement as written unless the founder overrides |
| **Deciders** | engineering |
| **Bounded by** | ABU-001, CON-005, CON-006, RSK-004 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

The limit is per client IP, and the service runs directly on a dev machine or small VM behind a VPN with no proxy. `X-Forwarded-For` is client-controlled and would let anyone dodge the limit by rotating a header.

## Decision

| | |
|---|---|
| **Decision** | In the context of a directly exposed service, facing trusting `X-Forwarded-For` vs the socket address, we chose **`req.socket.remoteAddress`**, with `::ffff:a.b.c.d` normalised to `a.b.c.d`, and never read forwarded headers, to achieve an unspoofable limit key, accepting that behind a reverse proxy all users share one bucket. IPs are held only in the limiter map and never logged. |
| **Revisit trigger** | A reverse proxy is placed in front of the service (then add an explicit trusted-proxy setting). |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Trust `X-Forwarded-For` | works behind a proxy | trivially spoofable here | ✗ |
| **Socket address** | unspoofable | shared bucket behind a proxy | ✓ |
| Configurable trusted proxy | flexible | scope beyond the prototype | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | No configuration; deterministic |
| Harder | HTTP tests all come from loopback, so per-IP independence is tested at the limiter unit level |
| Off the table | Proxy-aware deployments |
| Build deviation | *(filled at Built)* |
