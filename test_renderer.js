import fs from 'fs';

const testCode = `V: 1.0
B: 逆向工程驗證曲
B: 測試副標題
Z: Antigravity 詞曲
D: 1=G
P: 4/4
J: 72
Q: 1 1 5 5 | 6 6 5 - | ( 4 4 3 3 ) | 2/ 2/ 2/ 2/ 1 - ||
C: 一閃 一閃 亮晶 晶 滿天 都是 小星 星
`;

const webCode = fs.readFileSync('web/zhipu-local-renderer.js', 'utf8');
const fn = new Function('code', webCode + '; return ZhipuRenderer.renderZhipuScore(code);');
const svg = fn(testCode);

console.log('--- TEST RESULTS ---');
console.log('Compiled Bundle SVG Output Length:', svg.length);
console.log('Contains Bézier slur curve (path):', svg.includes('<path d="M'));
console.log('Contains underline beam (rect):', svg.includes('width="13"'));
console.log('Contains lyrics text:', svg.includes('一閃'));
console.log('Contains title text:', svg.includes('逆向工程驗證曲'));

fs.writeFileSync('web/test_ts_rendered.svg', svg);
console.log('Saved web/test_ts_rendered.svg successfully!');
