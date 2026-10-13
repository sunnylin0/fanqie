const fs = require('fs');

const fullTestCode = `V: 1.0
B: 符号大全测试
B: 副标题
Z: 作词人 词
Z: 作曲人 曲
D: 1=C
P: 4/4
J: 80
Q: 1. 2_ 3__ ( 4 5 ) | 6 - - - | 7^ 1' 2, 0 | 1= 2== | 1 2 3 4 :|: 5 6 7 1 ||
C: 附 点 减 时 连 音 线 延 长 音 升 高 低 休 附 割 反 复 终 止 符
`;

const body = new URLSearchParams();
body.append('code', fullTestCode.replace(/\n/g, '&hh&'));
body.append('customCode', '');
body.append('pageConfig', JSON.stringify({
  page: 'A4',
  margin_top: '80',
  margin_bottom: '80',
  margin_left: '80',
  margin_right: '80',
  biaoti_font: 'Microsoft YaHei',
  shuzi_font: 'b',
  geci_font: 'Microsoft YaHei'
}));
body.append('pageNum', '-1');

fetch('http://zhipu.lezhi99.com/Zhipu-draw', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  },
  body: body.toString()
})
  .then(res => res.text())
  .then(svg => {
    fs.writeFileSync('web/full_catalog.svg', svg);
    const defsMatch = svg.match(/<defs>([\s\S]*?)<\/defs>/);
    if (defsMatch) {
      fs.writeFileSync('web/complete_svg_defs.xml', defsMatch[1]);
      console.log('Saved complete_svg_defs.xml, size:', defsMatch[1].length);
      const regex = /<g id="([^"]+)"/g;
      const ids = [];
      let m;
      while ((m = regex.exec(defsMatch[1])) !== null) ids.push(m[1]);
      console.log('Discovered All Glyphs (' + ids.length + '):\n', ids.join(', '));
    }
  })
  .catch(err => console.error(err));
