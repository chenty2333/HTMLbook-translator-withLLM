# HTML 语义翻译批处理工具

[English README](README_en.md)

## 环境要求

- Node.js ≥ 18（推荐 v23.11.0）
- npm ≥ 8（推荐 10.9.2）
- dotenv@16.5.0
- puppeteer@24.9.0

本项目已锁定依赖版本，直接 `npm install` 即可复现环境。

# HTML 语义翻译批处理工具

本项目是一个通用的 HTML 语义内容批量翻译与注入工具，适用于技术文档、电子书等大体量 HTML 文件的高质量自动翻译。

> **注意：翻译完成后，请务必手动检查和修改生成的 HTML 文件的头部信息（如 `lang`、`title`、`meta` 标签等），以确保页面语言、标题、作者等信息与目标语言一致。例如：
>
> ```html
> <!DOCTYPE html>
> <html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN" xml:lang="zh-CN">
> <head>
>   <meta charset="utf-8">
>   <meta name="generator" content="pandoc">
>   <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
>   <meta name="author" content="Rui Ueyama &lt;ruiu@cs.stanford.edu&gt;">
>   <meta name="dcterms.date" content="2020-03-16">
>   <title>低层次开发者的C编译器入门</title>
>   ...
> ```
>
> 这样可以让最终页面在浏览器和搜索引擎中正确显示为中文。

## 主要功能

- 自动提取 HTML 文件中的语义文本块（如段落、标题、列表等）
- 支持分批次生成翻译提示，便于大模型 API 批量处理
- 自动合并翻译结果，保持编号与原文一一对应
- 一键将翻译内容注入原始 HTML，保留原有结构和格式
- 所有参数均可通过 `config.json` 配置，支持多项目复用

## 目录结构

```
├── batches/                # 生成的翻译批次文本
├── results/                # 各批次翻译结果
├── compilerbook.html       # 示例源 HTML（可替换为任意 HTML）
├── config.json             # 全局配置文件
├── text_nodes.json         # 提取的语义节点（自动生成）
├── translated_nodes.json   # 合并后的翻译结果（自动生成）
├── book_zh.html            # 注入翻译后的 HTML（自动生成）
├── semantic_extractor.js   # 语义节点提取脚本
├── build_prompts.js        # 构建翻译批次脚本
├── translate_gemini.js     # Gemini API 批量翻译脚本
├── merge_translation.js    # 合并翻译结果脚本
├── inject_translations.js  # 注入翻译内容脚本
└── ...
```

## 快速开始

1. **安装依赖**

   ```bash
   npm install
   ```

2. **配置 API 密钥**

   创建 `.env` 文件并在其中设置 `GEMINI_API_KEY` 等于自己的 API key。

3. **配置参数**

   编辑 `config.json`，可自定义源文件、输出文件、批次大小、翻译模型等。

4. **提取语义节点**

   ```bash
   node semantic_extractor.js
   ```

   生成 `text_nodes.json`。

5. **构建翻译批次**

   ```bash
   node build_prompts.js
   ```

   在 `batches/` 目录下生成批次文件。

6. **批量翻译**

   ```bash
   node translate_gemini.js
   ```

   结果保存在 `results/` 目录。

7. **合并翻译结果**

   ```bash
   node merge_translation.js
   ```

   生成 `translated_nodes.json`。

8. **注入翻译内容**

   ```bash
   node inject_translations.js
   ```

   生成最终的 `book_zh.html`。

## 配置说明（config.json）

- `files.sourceHtml`：源 HTML 文件名
- `files.outputHtml`：输出 HTML 文件名
- `files.textNodes`：提取节点 JSON 文件名
- `files.translatedNodes`：翻译结果 JSON 文件名
- `directories.batches`：翻译批次目录
- `directories.results`：翻译结果目录
- `extraction.tags`：需要提取的 HTML 标签
- `translation.model`：大模型名称（如 gemini-1.5-pro）
- `translation.batchSize`：每批次翻译的段落数

## 适用场景

- 技术书籍、教程、API 文档等大体量 HTML 翻译
- 需要批量处理、自动注入的多语种内容迁移
- 任何需要结构化、可追溯翻译流程的场景

## 注意事项

- 请勿将 `.env`、API 密钥、生成的中间文件提交到 Git 仓库
- 支持自定义 HTML 标签、批次大小、输出路径等
- 支持多种大模型 API（可扩展）

## License

MIT
