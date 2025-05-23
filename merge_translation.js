// merge_translations.js
// 合并翻译结果脚本
const fs = require('fs');
const path = require('path');

// 加载配置文件
// Load configuration file
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf-8'));

const original = JSON.parse(fs.readFileSync(config.files.textNodes, 'utf-8'));
const resultDir = config.directories.results;
const files = fs.readdirSync(resultDir).filter(f => f.endsWith('.txt'));

const translated = [...original]; // 复制原始结构 // Copy original structure

for (const file of files) {
  const lines = fs.readFileSync(path.join(resultDir, file), 'utf-8').split('\n');
  for (const line of lines) {
    // 匹配编号和翻译内容 // Match id and translation
    const match = line.match(/^(\d+)\.\s*(.*)$/);
    if (match) {
      const id = parseInt(match[1]);
      const translation = match[2];
      const node = translated.find(item => item.id === id);
      if (node) node.translated = translation;
    }
  }
}

fs.writeFileSync(config.files.translatedNodes, JSON.stringify(translated, null, 2), 'utf-8');
console.log(`✅ Merged ${files.length} batch files into ${config.files.translatedNodes}`); // 合并完成
