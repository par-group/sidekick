// Deletes the local database, generated secrets and uploads in ./data. They're
// recreated (and re-seeded) automatically the next time the app handles a request.
// Only affects local development; a hosted Turso database is never touched.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data");
fs.rmSync(dir, { recursive: true, force: true });
console.log("Removed ./data. Restart `npm run dev` for a freshly seeded local database.");
