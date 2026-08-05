---
description: "Diagnose and fix account creation / login failures across the client UI and Express+Mongoose backend"
agent: "agent"
argument-hint: "Optional: paste the error/symptom you're seeing (e.g. a browser console error or server log line)"
---
Investigate why users cannot register or log in on Travel Loop. Check both the backend and the UI, in this order:

1. **Start the backend** ([server/server.js](../../server/server.js)) and read its startup logs closely.
   - If it exits/crashes instead of staying up, the most common cause is `connectDatabase()` in [server/config/db.js](../../server/config/db.js) throwing (bad `MONGO_URI`, DNS/SRV resolution failure, IP not allow-listed, wrong credentials). Per this repo's demo-mode design (see [AGENTS.md](../../AGENTS.md)), a failed Mongo connection must NOT be fatal — the server should log a warning and keep serving requests via the in-memory fallback in [server/data/repository.js](../../server/data/repository.js) (`isMongoReady()` check).
   - On Windows, PowerShell may block npm scripts — use `cmd /c "npm ..."` or invoke `node`/`vite` binaries directly.

2. **Exercise the auth endpoints directly** with curl (bypasses the UI to isolate client vs. server issues):
   ```
   curl.exe -s -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" --data-binary "@register.json"
   curl.exe -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" --data-binary "@login.json"
   ```
   (Write the JSON body to a temp file first — PowerShell mangles inline `-d '{...}'` quoting with curl.exe.)
   Confirm register returns `201` with a `token`, and login with the same credentials returns `200` with a `token`.

3. **Check the controller logic** in [server/controllers/authController.js](../../server/controllers/authController.js): duplicate-email check via `findUserByEmail`, `bcrypt.compareSync` on login, and that both responses include `token` + `user`.

4. **Check the client wiring**:
   - [client/src/services/api.js](../../client/src/services/api.js): `api.register`/`api.login` hit the right paths and `api.login` stores the token in `localStorage` under `travel-loop-token`.
   - [client/src/App.jsx](../../client/src/App.jsx) `handleAuthSubmit`: confirm it calls the right function based on `authMode`, and that `error.message` (thrown by `request()` in api.js on non-2xx) is surfaced via `setMessage`, not swallowed.
   - Confirm `VITE_API_URL` / `CLIENT_ORIGIN` env vars point client and server at each other and CORS isn't blocking the request (check the browser Network tab / console for CORS or connection-refused errors).

5. Report the root cause plainly, apply the minimal fix, then re-run the curl checks from step 2 to prove register + login both succeed before concluding.
