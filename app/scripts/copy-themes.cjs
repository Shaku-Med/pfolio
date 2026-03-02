const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "app", "lib", "styles", "themes");
const dest = path.join(__dirname, "..", "public", "themes");

if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
const files = fs.readdirSync(src).filter((f) => f.endsWith(".css"));
files.forEach((f) => fs.copyFileSync(path.join(src, f), path.join(dest, f)));
console.log("Copied", files.length, "theme CSS files to public/themes");
