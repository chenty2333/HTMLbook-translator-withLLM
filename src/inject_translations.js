const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
// Database API
const { openDb, getTranslatedNodes } = require('./db');

// 加载配置文件
// Load configuration file
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8'));
// Project root directory
const ROOT = path.resolve(__dirname, '..');

;(async () => {
  // Initialize database and load translated nodes
  openDb();
  const translations = getTranslatedNodes();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 读取原始 HTML 文件
  // Read source HTML file
  const htmlPath = path.resolve(ROOT, config.files.sourceHtml);
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  await page.setContent(htmlContent);

  // 读取翻译结果已由数据库获取，移除文件读取逻辑

  await page.evaluate((data) => {
    function getNodeByXPath(xpath) {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    }

    for (const { xpath, translated } of data) {
      try {
        const el = getNodeByXPath(xpath);
        if (el && translated) {
          const tag = el.tagName;
          if (["PRE", "CODE", "SAMP"].includes(tag)) {
            el.textContent = translated;
          } else {
            el.innerText = translated;
          }
          el.setAttribute('data-translated', 'true');
        }
      } catch (err) {
        console.warn(`⚠️ XPath 失败: ${xpath}`); // XPath failed
      }
    }
  }, translations);
  const finalHTML = await page.content();
  const outHtml = path.resolve(ROOT, config.files.outputHtml);
  fs.mkdirSync(path.dirname(outHtml), { recursive: true });
  fs.writeFileSync(outHtml, finalHTML, 'utf-8');
  console.log(`✅ 已保存翻译后的 HTML 到 ${outHtml}`); // Saved translated HTML

  await browser.close();
})();
