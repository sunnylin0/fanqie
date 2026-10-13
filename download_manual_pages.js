const fs = require('fs');
const path = require('path');

const ids = [
  154, 166, 155, 120, 152, 178, 122, 134, 123, 128,
  150, 130, 129, 125, 153, 127, 124, 126, 131, 132,
  143, 167, 148, 151, 149
];

const outDir = path.join('docs', 'spec');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function downloadAll() {
  for (const id of ids) {
    const url = `http://doc.lezhi99.com/Index-view-id-${id}.html`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        fs.writeFileSync(path.join(outDir, `${id}.html`), text);
        console.log(`Saved doc ${id}`);
      } else {
        console.warn(`Failed ${id}: ${res.status}`);
      }
    } catch (e) {
      console.error(`Error ${id}:`, e.message);
    }
  }
  console.log('Finished downloading all spec pages!');
}

downloadAll();
