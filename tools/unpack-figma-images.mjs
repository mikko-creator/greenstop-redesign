// Unpack the "MPK1:" + JSON image pack carried out of the Figma tab (recv-server inbox) into a folder.
// Usage: node tools/unpack-figma-images.mjs <inbox/figma-images.txt> <outDir>
import fs from 'node:fs';
import path from 'node:path';
const [inp, outDir] = process.argv.slice(2);
const raw = fs.readFileSync(inp, 'utf8');
if (!raw.startsWith('MPK1:')) { console.error('not an MPK1 payload'); process.exit(1); }
const pack = JSON.parse(raw.slice(5));
fs.mkdirSync(outDir, { recursive: true });
const index = [];
for (const it of pack) {
  const base = it.name.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + it.hash.slice(0, 6);
  const file = base + '.' + it.ext;
  fs.writeFileSync(path.join(outDir, file), Buffer.from(it.b64, 'base64'));
  index.push({ file, figmaName: it.name, hash: it.hash, ext: it.ext, srcExt: it.srcExt || it.ext, srcW: it.srcW || null, srcH: it.srcH || null, w: it.w || null, h: it.h || null });
}
fs.writeFileSync(path.join(outDir, 'INDEX.json'), JSON.stringify(index, null, 1));
console.log('unpacked', index.length, 'files to', outDir);
