import fs from 'fs';
import path from 'path';

const outDir = path.resolve('dist/backend');
fs.mkdirSync(outDir, { recursive: true });

const files = ['index.js', 'wrangler.jsonc', 'schema.jsonc'];
for (const file of files) {
  const src = path.resolve('src/backend', file);
  const dest = path.resolve(outDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}
console.log('✔ Backend assets prepared in dist/backend');
