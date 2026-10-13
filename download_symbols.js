import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const symbolDir = path.join(__dirname, 'web', 'Public', 'symbol');
if (!fs.existsSync(symbolDir)) {
  fs.mkdirSync(symbolDir, { recursive: true });
}

// Extract all numbers from Zhipu-addCustomSymbol.html
const htmlPath = path.join(__dirname, 'web', 'Zhipu-addCustomSymbol.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const numMatches = [...htmlContent.matchAll(/num="(\d+)"/g)].map(m => parseInt(m[1], 10));
const uniqueNums = new Set(numMatches);

// Also probe 1 to 100
for (let i = 1; i <= 80; i++) {
  uniqueNums.add(i);
}

const list = Array.from(uniqueNums).sort((a, b) => a - b);
console.log(`Checking ${list.length} symbols...`);

async function downloadFile(url, dest) {
  try {
    const res = await fetch(url);
    if (res.status === 200) {
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

async function run() {
  let pngCount = 0;
  let txtCount = 0;

  for (const num of list) {
    const pngPath = path.join(symbolDir, `${num}.png`);
    const txtPath = path.join(symbolDir, `${num}.txt`);

    const pngUrl = `http://zhipu.lezhi99.com/Public/symbol/${num}.png`;
    const txtUrl = `http://zhipu.lezhi99.com/Public/symbol/${num}.txt`;

    const okPng = await downloadFile(pngUrl, pngPath);
    if (okPng) pngCount++;

    const okTxt = await downloadFile(txtUrl, txtPath);
    if (okTxt) txtCount++;

    if (okPng || okTxt) {
      console.log(`Symbol ${num}: png=${okPng}, txt=${okTxt}`);
    }
  }

  console.log(`Downloaded ${pngCount} PNGs and ${txtCount} TXTs to ${symbolDir}`);
}

run();
