import { build } from 'esbuild';
import { mkdir, copyFile, cp, rm } from 'node:fs/promises';

await build({ entryPoints: ['src/app.js'], bundle: true, format: 'iife', target: ['es2020'], outfile: 'app.bundle.js' });
await rm('_site', { recursive: true, force: true });
await mkdir('_site');
for (const file of ['index.html', 'index-6.html', 'styles.css', 'header.css', 'quintal.css', 'config.js', 'app.bundle.js']) {
  await copyFile(file, `_site/${file}`);
}
await cp('assets', '_site/assets', { recursive: true });
console.log('Site pronto em _site/ e index.html pronto para abrir pela pasta.');
