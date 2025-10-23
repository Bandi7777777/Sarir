import { promises as fs } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve("packages/frontend");
const srcDir = path.join(root, "src");
const pkgPath = path.join(root, "package.json");

// فقط import/require واقعی و نام‌های معتبر پکیج: @scope/name یا name
const importRe = /(?:^|\s)(?:import|require)\s*(?:[\s\w{},*]+\sfrom\s*)?\(?["'`]([^"'`]+)["'`]\)?/g;
const validPkgRe = /^@?[\w-]+(?:\/[\w-]+)?$/;

const IGNORE = new Set(["next", "react", "react-dom"]);
function isLocal(id) {
  return id.startsWith(".") || id.startsWith("/") || id.startsWith("@/");
}
function looksLikeFile(id) {
  return /\.[cm]?[tj]sx?$|\.css$|\.json$/.test(id);
}

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(e.name)) out.push(p);
  }
  return out;
}

async function main() {
  const files = await walk(srcDir);
  const imports = new Set();

  for (const f of files) {
    const code = await fs.readFile(f, "utf8");
    let m;
    while ((m = importRe.exec(code))) {
      const id = m[1].trim();
      if (isLocal(id) || looksLikeFile(id)) continue;
      const rootId = id.startsWith("@") ? id.split("/").slice(0, 2).join("/") : id.split("/")[0];
      if (!validPkgRe.test(rootId)) continue;
      if (!IGNORE.has(rootId)) imports.add(rootId);
    }
  }

  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  const have = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);

  const missing = [...imports].filter((n) => !have.has(n));
  if (missing.length === 0) {
    console.log("✅ پکیج جا‌مانده‌ای پیدا نشد.");
    return;
  }

  console.log("📦 نصب پکیج‌های جا مانده:", missing.join(" "));
  execSync(`pnpm -C ${JSON.stringify(root)} add ${missing.map((m) => `${m}@latest`).join(" ")}`, {
    stdio: "inherit",
  });
  console.log("✅ تمام شد.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
