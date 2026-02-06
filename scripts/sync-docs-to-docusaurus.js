import fs from "fs";
import path from "path";

const srcRoot = "docs";
const dstRoot = "docs-site/docs";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readFirstHeading(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function hasFrontmatter(content) {
  return content.trimStart().startsWith("---");
}

function withFrontmatter(content, title, extra = "") {
  const header = `---\ntitle: ${title}\n${extra}---\n\n`;
  return header + content;
}

function copyFileWithFrontmatter(src, dst, options = {}) {
  const content = fs.readFileSync(src, "utf8");
  const title =
    options.title || readFirstHeading(content) || path.basename(src, ".md");

  if (hasFrontmatter(content)) {
    fs.writeFileSync(dst, content);
    return;
  }

  fs.writeFileSync(dst, withFrontmatter(content, title, options.extra || ""));
}

function clearDir(dir) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      clearDir(p);
      fs.rmdirSync(p);
    } else {
      fs.unlinkSync(p);
    }
  }
}

function walkAndCopy(dir, rel = "") {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const srcPath = path.join(dir, entry);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      walkAndCopy(srcPath, path.join(rel, entry));
      continue;
    }

    if (!entry.endsWith(".md")) continue;
    if (path.join(rel, entry) === "README.md") continue;

    const dstDir = path.join(dstRoot, rel);
    ensureDir(dstDir);
    const dstPath = path.join(dstDir, entry);
    copyFileWithFrontmatter(srcPath, dstPath);
  }
}

clearDir(dstRoot);
ensureDir(dstRoot);

copyFileWithFrontmatter(path.join(srcRoot, "README.md"), path.join(dstRoot, "overview.md"), {
  title: "Überblick",
  extra: "slug: /overview\n",
});

walkAndCopy(srcRoot);

console.log("Synced docs/ -> docs-site/docs/");
