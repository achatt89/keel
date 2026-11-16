# booking

Meeting-room booking library. Node.js 20+, no dependencies.

```js
import { createBookings } from './src/booking.js';
const b = createBookings();
const id = b.book({ room: 'oak', start: '2026-03-02T10:00Z', end: '2026-03-02T11:00Z', who: 'ana' });
b.free('oak', '2026-03-02'); // [{09:00-10:00}, {11:00-18:00}]
```

Tests: `node --test`.
