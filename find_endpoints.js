const fs = require('fs');
const code = fs.readFileSync('extracted/Zhipu-jsCode.js', 'utf8');
const html = fs.readFileSync('extracted/zhipu-index-windows-y.html', 'utf8');

const combined = code + '\n' + html;
const set = new Set();
const regex = /["'](\/[Zz]hipu[^"'?#\s]*)/g;
let m;
while ((m = regex.exec(combined)) !== null) {
  set.add(m[1]);
}
console.log('--- Unique Endpoints ---');
for (const item of [...set].sort()) {
  console.log(item);
}
