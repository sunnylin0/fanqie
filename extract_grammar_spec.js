const fs = require('fs');
const path = require('path');

const ids = [
  { id: 154, title: '描述头说明' },
  { id: 166, title: '脚本注释' },
  { id: 155, title: '简谱主体说明' },
  { id: 120, title: '基本音符与休止符' },
  { id: 152, title: '增时线与减时线' },
  { id: 178, title: '自定义节拍切分' },
  { id: 122, title: '附点音符' },
  { id: 134, title: '力度与渐强渐弱' },
  { id: 123, title: '升降音与还原符号' },
  { id: 128, title: '装饰音（倚音）' },
  { id: 150, title: '伴奏部分的括弧' },
  { id: 130, title: '其他常用音符符号' },
  { id: 129, title: '音符注释' },
  { id: 125, title: '小节线' },
  { id: 153, title: '小节线上的反复符号' },
  { id: 127, title: '连音线' },
  { id: 124, title: '连音与多连音' },
  { id: 126, title: '跳房子' },
  { id: 131, title: '临时拍号' },
  { id: 132, title: '临时伴奏与多声部' },
  { id: 143, title: '多声部' },
  { id: 167, title: '分页' },
  { id: 148, title: '中文歌词' },
  { id: 151, title: '歌词注释' },
  { id: 149, title: '英文歌词特别说明' }
];

let specMd = '# 番茄簡譜腳本語法全集規範 (Zhipu Notation Grammar Specification)\n\n';

for (const item of ids) {
  const filePath = path.join('docs', 'spec', `${item.id}.html`);
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  // Strip HTML tags to extract clean text
  const bodyMatch = content.match(/<div class="content">([\s\S]*?)<\/div>/i) || content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let text = bodyMatch ? bodyMatch[1] : content;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '')
             .replace(/<style[\s\S]*?<\/style>/gi, '')
             .replace(/<br\s*[\/]?>/gi, '\n')
             .replace(/<\/p>/gi, '\n\n')
             .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => '\n```\n' + code.replace(/<[^>]+>/g, '') + '\n```\n')
             .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
             .replace(/<[^>]+>/g, '')
             .replace(/&nbsp;/g, ' ')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&amp;/g, '&')
             .trim();

  specMd += `## ${item.title} (ID: ${item.id})\n\n${text}\n\n---\n\n`;
}

fs.writeFileSync('docs/spec/GRAMMAR_SPEC.md', specMd);
console.log('Saved docs/spec/GRAMMAR_SPEC.md, length:', specMd.length);
