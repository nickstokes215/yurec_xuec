import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const src = "node_modules/@electric-sql/pglite/dist";
const dest = ".vercel/output/functions/__server.func/_libs";
if (!existsSync(dest) || !existsSync(src)) process.exit(0);
for (const f of readdirSync(src)) {
  if (/\.(wasm|data|tar\.gz)$/i.test(f)) {
    copyFileSync(join(src, f), join(dest, f));
  }
}
