const fs = require('fs');

let code = fs.readFileSync('extracted/Zhipu-jsCode.js', 'utf8');

// Patch 1: audioFont path
code = code.replace('/Public/js/audioFont/', 'Public/js/audioFont/');

// Patch 2: Zhipu-draw endpoint
code = code.replace("$.post('/Zhipu-draw'", "$.post('http://zhipu.lezhi99.com/Zhipu-draw'");

// Patch 3: example file local fallback
code = code.replace(
  '$.getJSON("/zhipu-getExampleFile?id="+exampleFileId,function(data){',
  'var exUrl = (exampleFileId == 43 ? "./example43.jps" : "http://zhipu.lezhi99.com/zhipu-getExampleFile?id=" + exampleFileId); $.getJSON(exUrl, function(data){'
);

// Patch 4: canvg script paths for PNG export
code = code.replace("$.getScript('/Public/js/canvg/", "$.getScript('Public/js/canvg/");

fs.writeFileSync('web/Zhipu-jsCode.js', code);
console.log('web/Zhipu-jsCode.js generated successfully! Length:', code.length);
