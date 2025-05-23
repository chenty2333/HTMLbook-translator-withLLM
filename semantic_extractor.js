const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// 加载配置文件
// Load configuration file
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf-8'));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 读取 HTML 文件
  // Read HTML file
  const htmlPath = path.resolve(__dirname, config.files.sourceHtml);
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  await page.setContent(htmlContent);

  // 提取语义文本块
  // Extract semantic text blocks
  const textBlocks = await page.evaluate((extractionConfig) => {
    const TAGS = extractionConfig.tags;

    // 生成 XPath 路径的函数
    // Function to generate XPath for elements
    function getXPath(el) {
      const parts = [];
      while (el && el !== document) {
        const parent = el.parentNode;
        if (!parent) break;
        const siblings = Array.from(parent.children).filter(n => n.tagName === el.tagName);
        const index = siblings.indexOf(el) + 1;
        parts.unshift(`${el.tagName.toLowerCase()}[${index}]`);
        el = parent;
      }
      return '/' + parts.join('/');
    }

    // 判断是否应该跳过某个元素
    // Function to determine if an element should be skipped
    function shouldSkip(el) {
      const tag = el.tagName.toLowerCase();
      if (["script", "style", "noscript", "pre", "code", "samp"].includes(tag)) return true;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return true;
      return false;
    }

    const results = [];
    document.querySelectorAll(TAGS.join(',')).forEach(el => {
      if (shouldSkip(el)) return;
      const text = el.innerText.trim();
      if (!text) return;

      results.push({
        xpath: getXPath(el),
        text: text
      });
    });
    return results;
  }, config.extraction);

  const withIds = textBlocks.map((item, idx) => ({ id: idx + 1, ...item }));
  fs.writeFileSync(config.files.textNodes, JSON.stringify(withIds, null, 2), 'utf-8');
  console.log(`✅ 提取 ${withIds.length} 段语义文本，已写入 ${config.files.textNodes}`); // 提取完成

  await browser.close();
})();
// 这段代码提取了 HTML 文档中的文本节点，并为每个节点生成了唯一的 XPath 和 ID。最终结果被保存为 JSON 格式，便于后续处理。
// This script extracts text nodes from an HTML document, generates unique XPath and ID for each node, and saves the result as JSON for further processing.