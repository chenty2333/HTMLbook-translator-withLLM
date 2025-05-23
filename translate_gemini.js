require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 加载配置文件
// Load configuration file
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf-8'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = config.translation.systemPrompt;

async function translateBatch(batchText) {
  // 获取翻译模型
  // Get translation model
  const model = genAI.getGenerativeModel({ model: config.translation.model });

  const prompt = `${systemPrompt}\n\n请翻译以下内容为简体中文：\n\n${batchText}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text().trim();
}

async function main() {
  // 输入输出目录
  // Input/output directories
  const inputDir = config.directories.batches;
  const outputDir = config.directories.results;
  // 自动创建 results 目录（如果不存在）
  // Auto-create results directory if not exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const files = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.txt'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/batch_(\d+)\.txt/)[1], 10);
      const numB = parseInt(b.match(/batch_(\d+)\.txt/)[1], 10);
      return numA - numB;
    });

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    if (fs.existsSync(outputPath)) {
      console.log(`⚠️ 已跳过已存在结果文件: ${file}`); // Skipped existing result file
      continue;
    }

    const batchText = fs.readFileSync(inputPath, 'utf-8');
    console.log(`🧠 正在翻译 ${file} ...`); // Translating

    try {
      const result = await translateBatch(batchText);
      // 翻译完成后再写入文件 // Write after translation
      fs.writeFileSync(outputPath, result, 'utf-8');
      console.log(`✅ 翻译完成: ${file}`); // Translation done
    } catch (err) {
      console.error(`❌ 翻译失败: ${file}`, err.message); // Translation failed
      break;
    }
  }

  console.log('🎉 所有批次翻译任务完成'); // All batches done
}

main();
