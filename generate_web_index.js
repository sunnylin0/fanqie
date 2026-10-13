const fs = require('fs');

let html = fs.readFileSync('extracted/zhipu-index-windows-y.html', 'utf8');

// Replace root paths with relative
html = html.replace(/href="\/Public\//g, 'href="Public/');
html = html.replace(/src="\/Public\//g, 'src="Public/');
html = html.replace(/src="\/Zhipu-jsCode"/g, 'src="Zhipu-jsCode.js"');

// Remove Flash player object
html = html.replace(/<object[\s\S]*?<\/object>/gi, '<!-- Flash Player replaced by Web Audio API & Soundfont -->');

fs.writeFileSync('web/index.html', html);
console.log('web/index.html generated successfully! Length:', html.length);
