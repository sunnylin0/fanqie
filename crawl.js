const fs = require('fs');
const path = require('path');

const baseUrl = 'http://zhipu.lezhi99.com';
const downloaded = new Set();

async function download(relUrl) {
  if (!relUrl || relUrl.startsWith('data:') || relUrl.startsWith('javascript:') || relUrl.startsWith('#')) return;
  relUrl = relUrl.split('?')[0].split('#')[0];
  if (!relUrl.startsWith('/')) relUrl = '/' + relUrl;
  if (downloaded.has(relUrl)) return;
  downloaded.add(relUrl);

  const fullUrl = baseUrl + relUrl;
  const localPath = path.join('extracted', relUrl.replace(/\//g, path.sep));
  try {
    const res = await fetch(fullUrl);
    if (!res.ok) {
      console.log('Failed (' + res.status + '):', relUrl);
      return;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, buf);
    console.log('Downloaded:', relUrl, '(' + buf.length + ' bytes)');

    if (relUrl.endsWith('.css') || relUrl.endsWith('.html') || relUrl.endsWith('.js')) {
      const text = buf.toString('utf8');
      const regex = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
      let m;
      while ((m = regex.exec(text)) !== null) {
        let subUrl = m[1];
        if (!subUrl.startsWith('/') && !subUrl.startsWith('http')) {
          subUrl = path.posix.join(path.posix.dirname(relUrl), subUrl);
        }
        await download(subUrl);
      }

      // Also match src and href
      const attrRegex = /(?:src|href)=['"]([^'"]+)['"]/gi;
      while ((m = attrRegex.exec(text)) !== null) {
        let subUrl = m[1];
        if (subUrl.endsWith('.png') || subUrl.endsWith('.jpg') || subUrl.endsWith('.gif') || subUrl.endsWith('.css') || subUrl.endsWith('.js') || subUrl.endsWith('.woff') || subUrl.endsWith('.ttf') || subUrl.endsWith('.swf')) {
          if (!subUrl.startsWith('/') && !subUrl.startsWith('http')) {
            subUrl = path.posix.join(path.posix.dirname(relUrl), subUrl);
          }
          await download(subUrl);
        }
      }
    }
  } catch (err) {
    console.error('Error downloading:', relUrl, err.message);
  }
}

async function main() {
  await download('/Public/zhipuStyle/default/main.css');
  await download('/Public/images/windows/title.png');
  await download('/Public/images/windows/but.png');
  await download('/Public/js/jquery.min.js');
  await download('/Public/js/vconsole.min.js');
  await download('/Zhipu-jsCode');
  
  // Also scan inside extracted/zhipu-index-windows-y.html
  const html = fs.readFileSync('extracted/zhipu-index-windows-y.html', 'utf8');
  const attrRegex = /(?:src|href|url)=['"]([^'"]+)['"]/gi;
  let m;
  while ((m = attrRegex.exec(html)) !== null) {
    let subUrl = m[1];
    if (!subUrl.startsWith('/') && !subUrl.startsWith('http')) {
      subUrl = '/' + subUrl;
    }
    await download(subUrl);
  }
}

main().then(() => console.log('All crawling finished!'));
