# AGENTS.md

## Architecture

npm workspaces monorepo: [client/](client/) (React + Vite SPA) and [server/](server/) (Express + Mongoose). See [README.md](README.md) for full feature list, env vars, and deployment options (Render/Railway/Docker) — don't duplicate that here.

- **No router**: `react-router-dom` is a dependency but unused. [client/src/App.jsx](client/src/App.jsx) is a single component; "navigation" is just anchor-hash links scrolling within one page. All client state is local `useState`/`useMemo` in `App.jsx` (no Context/Redux).
- **Demo mode fallback**: The app works fully without MongoDB. [server/data/repository.js](server/data/repository.js) checks `isMongoReady()` (live `User.db?.readyState === 1` check, not cached) on *every* call and branches between Mongoose and an in-memory `localState` object seeded from [server/data/seed.js](server/data/seed.js). If Mongo disconnects mid-session, calls silently fall back to (empty-looking) in-memory state.
- Controllers never call `repository.js` Mongoose models directly — they go through the exported functions (`bootstrapData`, `listPackages`, `createBooking`, `cancelBookingById`, `adminSummary`, etc.). Keep this abstraction when adding features so demo mode keeps working.
- Auth: [server/middleware/auth.js](server/middleware/auth.js) — `requireAuth` verifies `Authorization: Bearer <token>` JWT and sets `req.user` (`sub`/`email`/`role`/`name`); `requireRole('admin')` must be chained *after* `requireAuth`.

## Conventions

- Controllers are plain `async (req, res)` functions with manual `res.status(x).json({ message })` on errors — **no global Express error-handling middleware exists**, so uncaught async errors won't produce clean JSON responses. Wrap risky repository calls in try/catch like [bookingController.js](server/controllers/bookingController.js) does for cancellation.
- Response shape: list endpoints return `{ packages: [...] }`/`{ bookings: [...] }`; mutations return `{ <entity>, message }`; auth returns `{ token, user, message }`.
- Mongoose models: `mongoose.models.X || mongoose.model('X', xSchema)` guard to avoid recompilation errors — follow this pattern for new models.
- Client API calls go through [client/src/services/api.js](client/src/services/api.js)'s shared `request()` helper (attaches JSON headers + bearer token, throws on non-2xx). Add new endpoints there rather than calling `fetch` directly from components.
- No ESLint/Prettier config and no test suite exist in this repo — don't assume `npm run lint`/`npm test` work.

## Build and Test

```bash
npm install
npm run dev:server   # node server.js, no watch/reload — restart manually after server changes
npm run dev:client    # vite dev server
npm run build         # builds client then server (server build is a no-op)
npm run seed --workspace server   # reset + reseed MongoDB (requires MONGO_URI)
```

On Windows, PowerShell script execution is often disabled here — prefer `cmd /c "npm ..."` and `curl.exe` (not `curl`, which is aliased to `Invoke-WebRequest`).
