import fs from "fs";
import path from "path";

const srcDir = path.resolve("docs-site/build");
const dstDir = path.resolve("dist/docs");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
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

function copyDir(src, dst) {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const dstPath = path.join(dst, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

if (!fs.existsSync(srcDir)) {
  console.error(`Docs build not found at ${srcDir}`);
  process.exit(1);
}

ensureDir(path.resolve("dist"));
clearDir(dstDir);
copyDir(srcDir, dstDir);
console.log("Copied docs-site/build -> dist/docs");
