# HTML 语义翻译批处理工具

> **⚠️ 重要限制：本工具仅适用于内容全部在单一 HTML 文件中的书籍或文档，暂时不支持带有导航栏、目录页或多页面结构的电子书项目。**

> 📥 如果需要快速获取 HTML 文件，可以参考后文的 [HTML 文件下载指引](#html-文件下载指引)。（CTRL+右键点击跳转至相应板块）

[English README](README_en.md)

## 环境要求

- Node.js ≥ 18（推荐 v24.4.1）

- npm ≥ 8（推荐 11.4.2）


本项目已锁定依赖版本，直接 `npm install` 即可复现环境。

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
├── input/                    # 源 HTML 文件目录（input/index_.html）
├── output/                   # 输出的翻译后 HTML 文件（output/output.html）
├── intermediate/             # 中间产物目录
│   └── translation.db        # SQLite 数据库（包含所有中间数据和结果）
├── config.json               # 全局配置文件，定义路径和参数
├── src/                      # 脚本源码目录
│   ├── db.js                 # 数据库 API 模块
│   ├── semantic_extractor.js # 语义节点提取脚本
│   ├── build_prompts.js      # 构建翻译批次脚本
│   ├── translate_gemini.js   # Gemini API 批量翻译脚本
│   ├── merge_translation.js  # 合并翻译结果脚本
│   └── inject_translations.js# 注入翻译内容脚本
└── .gitignore
```

## 脚本说明

- **db.js**：数据库 API 模块，负责创建 SQLite 数据库连接、初始化表结构并提供增删改查接口。
- **semantic_extractor.js**：提取 HTML 文件中的语义文本节点，生成唯一 ID 和 XPath，将结果写入 `text_nodes` 表。
- **build_prompts.js**：从 `text_nodes` 表读取节点，按 `batchSize` 生成编号批次，并写入 `prompt_batches` 表。
- **translate_gemini.js**：从 `prompt_batches` 表读取批次提示，调用 Gemini API 进行翻译，并写入 `batch_translations` 表。
- **merge_translation.js**：从 `batch_translations` 表读取翻译结果，解析每行编号和译文，将翻译写入 `translated_nodes` 表。
- **inject_translations.js**：从 `translated_nodes` 表读取所有翻译内容，用 Puppeteer 将译文注入原始 HTML，并输出最终 HTML 文件。

## 快速开始

### ❗配置前置

在开始使用脚本前，请先编辑 `config.json`：
- 将 `files.sourceHtml` 设置为要翻译的 HTML 文件路径（例如 `input/index.html`）；
- 可修改 `database.path` 为对应的 SQLite 数据库文件名（如 `intermediate/yourfile.db`），实现对不同源文件的独立翻译流程。
- 详见下文`配置说明`中参数配置方法。

### 开始使用

1. **安装依赖**

   ```bash
   npm install
   ```

2. **配置 API 密钥**

   创建 `.env` 文件并在其中设置 `GEMINI_API_KEY` 等于自己的 API key。

4. **提取语义节点**

   ```bash
   node src/semantic_extractor.js
   ```

   生成 `text_nodes.json`。

5. **构建翻译批次**

   ```bash
   node src/build_prompts.js
   ```

   在 `batches/` 目录下生成批次文件。

6. **批量翻译**

   ```bash
   node src/translate_gemini.js
   ```

   结果保存在 `results/` 目录。

7. **合并翻译结果**

   ```bash
   node src/merge_translation.js
   ```

   生成 `translated_nodes.json`。

8. **注入翻译内容**

   ```bash
   node src/inject_translations.js
   ```

   生成最终的到 `config.json`中指定的输出位置。

## 配置说明（config.json）

- `files.sourceHtml`：源 HTML 文件路径，相对于项目根目录，例如 `input/index_.html`
- `files.outputHtml`：输出 HTML 文件路径，相对于项目根目录，例如 `output/output.html`
- `directories.batches`：批次目录（用于兼容旧配置，实际使用数据库管理）
- `directories.results`：结果目录（用于兼容旧配置，实际使用数据库管理）
- `translation.model`：大模型名称，如 `gemini-2.5-flash-lite`
- `translation.batchSize`：每批次翻译的段落数，按需增加或减少
- `database.path`：SQLite 数据库文件路径，相对于项目根目录，例如 `intermediate/translation.db`

- ❗`extraction.tags`：需要提取的 HTML 标签，可按照需求进行更改，推荐保持默认。部分标签的提取可能造成翻译格式问题，比如`<code>`标签，可以进行尝试

## ❓ FAQ
1. 如何翻译多个文件？
   - 修改 `config.json` 中 `files.sourceHtml` 和 `database.path`，重复执行流程。

## 适用场景

- 技术书籍、教程、API 文档等大体量 HTML 翻译
- 需要批量处理、自动注入的多语种内容迁移
- 任何需要结构化、可追溯翻译流程的场景

## 注意事项

- 本工具仅适用于内容全部在单一 HTML 文件中的书籍或文档，不支持带有导航栏、目录页或多页面结构的电子书项目。
- 请勿将 `.env`、API 密钥、生成的中间文件提交到 Git 仓库
- 支持自定义 HTML 标签、批次大小、输出路径等
- 支持多种大模型 API（可扩展）

## License

MIT



---



## HTML 文件下载指引

你可以使用 [`wget`](https://www.gnu.org/software/wget/) 工具批量下载网页内容，包括 HTML 文件及其相关资源。本节简要介绍 `wget` 的常见用法。

### 单页网页的完整下载

如果你只需要下载单个网页及其所需资源，可使用以下命令：

```bash
wget --convert-links --adjust-extension --page-requisites --no-parent https://example.com/
```

（将`https://example.com/`替换为你想要下载的网站链接）

**参数说明：**

- `--convert-links`：自动修正本地 HTML 中的链接，方便离线浏览。
- `--adjust-extension`：根据内容类型自动补全文件扩展名（如 `.html`）。
- `--page-requisites`：下载页面所需的所有资源（图片、CSS、JS 等）。
- `--no-parent`：仅下载当前目录及以下内容，不追溯上级目录。

执行后将在当前目录生成页面的 HTML 文件和资源文件夹，本地打开即可浏览。

### 递归下载整个网站或目录

如需下载多页 HTML 并保留网站目录结构，可加上递归参数：

```bash
wget -r --convert-links --adjust-extension --page-requisites --no-parent https://example.com/
```

- `-r` 或 `--recursive`：递归抓取所有链接页面，下载多页内容。
- 下载结果会生成以网站域名为根目录的文件夹，保留原始网站结构。

**示例目录结构：**

```
example.com/
  ├── index.html
  ├── page1.html
  ├── assets/
  └── ...
```

如需限制递归深度，可用 `-l 2` 控制抓取层级：

```bash
wget -r -l 2 --convert-links --adjust-extension --page-requisites --no-parent https://example.com/
```

### 其他说明

- `wget` 无法完整抓取部分依赖 JS 动态渲染的现代站点，仅适用于静态网页内容。
- 建议遵守目标网站爬虫政策，合理下载，避免过度抓取。

更多 `wget` 用法可参考官方文档或 `wget --help`。
