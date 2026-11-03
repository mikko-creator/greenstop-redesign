// Decode a window.name payload saved by recv-server.mjs: "HSB1:" + base64(gzip(JSON)).
// Usage: node tools/decode-inbox.mjs <inbox/name.txt> <out.json>
import fs from 'node:fs';
import zlib from 'node:zlib';

const [inp, out] = process.argv.slice(2);
const raw = fs.readFileSync(inp, 'utf8').trim();
if (!raw.startsWith('HSB1:')) { console.error('not an HSB1 payload; first 40 chars:', raw.slice(0, 40)); process.exit(1); }
const json = zlib.gunzipSync(Buffer.from(raw.slice(5), 'base64')).toString('utf8');
const data = JSON.parse(json);
fs.writeFileSync(out, JSON.stringify(data, null, 1));
console.log('decoded', inp, '->', out, json.length, 'chars');
