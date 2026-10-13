import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('web/index.html', 'utf8');
const js = fs.readFileSync('web/Zhipu-jsCode.js', 'utf8');
const text = html + '\n' + js;

const dialogs = new Set([
  'Zhipu-newFile.html',
  'Zhipu-fileBrowsing-type-open.html',
  'Zhipu-fileBrowsing-type-save.html',
  'Zhipu-exampleList.html',
  'Zhipu-pageConfig.html',
  'Zhipu-toPdf.html',
  'Zhipu-toJpg.html',
  'Zhipu-helpSymbol.html',
  'Zhipu-about.html',
  'Zhipu-player.html',
  'Zhipu-addCustomText.html',
  'Zhipu-login'
]);

// Extract all showWin occurrences
const regex = /showWin\s*\(\s*['"][^'"]*['"]\s*,\s*['"]([^'"]+)['"]/g;
let m;
while ((m = regex.exec(text)) !== null) {
  let u = m[1].replace(/^\.\//, '').split('?')[0];
  if (!u.startsWith('http') && !u.startsWith('/')) {
    dialogs.add(u);
  }
}

console.log('Dialog files to download (' + dialogs.size + '):');
for (const d of [...dialogs].sort()) console.log(' -', d);

async function downloadAll() {
  for (const name of dialogs) {
    const fullUrl = 'http://zhipu.lezhi99.com/' + name;
    try {
      const res = await fetch(fullUrl);
      if (res.ok) {
        const content = await res.text();
        const localPath = path.join('web', name);
        fs.writeFileSync(localPath, content);
        console.log(`Saved web/${name} (${content.length} bytes)`);
      } else {
        console.warn(`Failed ${name}: status ${res.status}`);
      }
    } catch (err) {
      console.error(`Error downloading ${name}:`, err.message);
    }
  }
  console.log('Finished downloading all dialog HTMLs!');
}

downloadAll();
