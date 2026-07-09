import { app } from "../server/app";

// Vercel Node.js runtime: an Express app instance is a valid (req, res)
// handler, so exporting it directly handles every request forwarded here by
// the vercel.json rewrite. No app.listen()/PORT — Vercel invokes this per
// request rather than running a persistent process.
export default app;
