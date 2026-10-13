const fs = require('fs');

const svg = fs.readFileSync('web/example43.svg', 'utf8');
const defsMatch = svg.match(/<defs>([\s\S]*?)<\/defs>/);
if (defsMatch) {
  fs.writeFileSync('web/svg_defs.xml', defsMatch[1]);
  console.log('Saved web/svg_defs.xml, size:', defsMatch[1].length);
  const ids = [];
  const regex = /<g id="([^"]+)"/g;
  let m;
  while ((m = regex.exec(defsMatch[1])) !== null) {
    ids.push(m[1]);
  }
  console.log('Total glyph defs in SVG:', ids.length);
  console.log('Glyph IDs:\n', ids.join(', '));
}

// Inspect elements inside body
const bodyPart = svg.slice(svg.indexOf('</defs>') + 7, svg.indexOf('</svg>'));
console.log('Body elements preview:\n', bodyPart.slice(0, 1000));
