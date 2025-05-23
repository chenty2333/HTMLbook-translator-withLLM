const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// 加载配置文件
// Load configuration file
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf-8'));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 读取原始 HTML 文件
  // Read source HTML file
  const htmlPath = path.resolve(__dirname, config.files.sourceHtml);
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  await page.setContent(htmlContent);

  // 读取翻译结果
  // Read translation results
  const translations = JSON.parse(fs.readFileSync(config.files.translatedNodes, 'utf-8'));

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
  fs.writeFileSync(config.files.outputHtml, finalHTML, 'utf-8');
  console.log(`✅ 已保存翻译后的 HTML 到 ${config.files.outputHtml}`); // Saved translated HTML

  await browser.close();
})();
