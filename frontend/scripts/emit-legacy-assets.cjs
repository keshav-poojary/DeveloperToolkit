const fs = require('fs');
const path = require('path');

// This script copies the newly-built index bundle to a legacy filename
// so old deployments or cached index.html files that reference the
// previous hashed filename continue to work until caches expire.

const distAssets = path.join(__dirname, '..', 'dist', 'assets');
// A newline-separated file with legacy asset basenames (in dist/assets) to emit.
const legacyListFile = path.join(__dirname, 'legacy-names.txt');

let legacyNames = ['index-DphsNMbW.js'];
if (fs.existsSync(legacyListFile)) {
  try {
    const contents = fs.readFileSync(legacyListFile, 'utf8');
    const lines = contents.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length) legacyNames = lines;
  } catch (e) { /* ignore */ }
}

function findIndexBundle() {
  if (!fs.existsSync(distAssets)) return null;
  const files = fs.readdirSync(distAssets);
  for (const f of files) {
    if (/^index-[^.]+\.js$/.test(f)) return f;
  }
  return null;
}

function copyLegacy() {
  const bundle = findIndexBundle();
  if (!bundle) {
    console.error('No index-*.js bundle found in', distAssets);
    process.exitCode = 1;
    return;
  }

  const src = path.join(distAssets, bundle);
  for (const legacyName of legacyNames) {
    const dst = path.join(distAssets, legacyName);
    fs.copyFileSync(src, dst);
    console.log(`Copied ${bundle} -> ${legacyName}`);

    // copy source map if present
    const mapSrc = src + '.map';
    const mapDst = dst + '.map';
    if (fs.existsSync(mapSrc)) {
      fs.copyFileSync(mapSrc, mapDst);
      console.log('Copied source map to', mapDst);
    }
  }
}

copyLegacy();
