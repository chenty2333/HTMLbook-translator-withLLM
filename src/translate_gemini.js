require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load configuration file
// Load configuration file
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8'));
// Project root directory
const ROOT = path.resolve(__dirname, '..');
// Database API
const { openDb, getPromptBatches, insertBatchTranslation } = require('./db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = config.translation.systemPrompt;

async function translateBatch(batchText) {
  // 获取翻译模型
  // Get translation model
  const model = genAI.getGenerativeModel({ model: config.translation.model });

  const prompt = `${systemPrompt}\n\nTranslate the following list of sentences to Chinese: \n\n${batchText}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text().trim();
}

async function main() {
  // Initialize database and load prompt batches
  openDb();
  const batches = getPromptBatches();
  for (const { batch_index: idx, content: batchText } of batches) {
    console.log(`🧠 正在翻译第 ${idx} 批次 ...`);
    try {
      const result = await translateBatch(batchText);
      // 保存翻译结果到数据库
      insertBatchTranslation(idx, result);
    } catch (err) {
      console.error(`❌ 批次 ${idx} 翻译失败`, err.message);
      break;
    }
  }
  console.log('🎉 所有批次翻译任务完成');
}

main();
