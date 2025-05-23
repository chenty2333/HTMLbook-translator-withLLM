[中文说明 (Chinese README)](README.md)

# HTML Semantic Translation Batch Tool

> **⚠️ Important Limitation: This tool currently only supports books or documents whose entire content is contained in a single HTML file. It does NOT support e-books with navigation bars, table of contents pages, or multi-page structures.**

## Environment Requirements

- Node.js ≥ 18 (Recommended: v23.11.0)
- npm ≥ 8 (Recommended: 10.9.2)
- dotenv@16.5.0
- puppeteer@24.9.0

All dependencies are version-locked. Just run `npm install` to reproduce the environment.

This project is a general-purpose tool for batch translation and injection of semantic content in HTML files. It is suitable for high-quality automatic translation of large-scale technical documents, e-books, and more.

> **Note:** After translation, please manually check and modify the header information of the generated HTML file (such as `lang`, `title`, `meta` tags, etc.) to ensure that the page language, title, author, and other information match the target language. For example:
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
>   <title>C Compiler Introduction for Low-level Developers</title>
>   ...
> ```
>
> This ensures that the final page is correctly displayed as Chinese in browsers and search engines.

[中文说明 (Chinese README)](README_zh.md)

## Main Features

- Automatically extract semantic text blocks from HTML files (such as paragraphs, headings, lists, etc.)
- Generate translation prompts in batches for efficient use of LLM APIs
- Automatically merge translation results, keeping IDs aligned with the original
- Inject translated content into the original HTML with one click, preserving structure and formatting
- All parameters are configurable via `config.json`, supporting multi-project reuse

## Directory Structure

```
├── batches/                # Generated translation batch files
├── results/                # Translation results for each batch
├── compilerbook.html       # Example source HTML (replaceable with any HTML)
├── config.json             # Global configuration file
├── text_nodes.json         # Extracted semantic nodes (auto-generated)
├── translated_nodes.json   # Merged translation results (auto-generated)
├── book_zh.html            # Final HTML with injected translations (auto-generated)
├── semantic_extractor.js   # Semantic node extraction script
├── build_prompts.js        # Build translation batch script
├── translate_gemini.js     # Gemini API batch translation script
├── merge_translation.js    # Merge translation results script
├── inject_translations.js  # Inject translation content script
└── ...
```

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure API key**

   Create a `.env` file and set `GEMINI_API_KEY` to your own API key.

3. **Configure parameters**

   Edit `config.json` to customize source/output files, batch size, translation model, etc.

4. **Extract semantic nodes**

   ```bash
   node semantic_extractor.js
   ```

   Generates `text_nodes.json`.

5. **Build translation batches**

   ```bash
   node build_prompts.js
   ```

   Generates batch files in the `batches/` directory.

6. **Batch translation**

   ```bash
   node translate_gemini.js
   ```

   Results are saved in the `results/` directory.

7. **Merge translation results**

   ```bash
   node merge_translation.js
   ```

   Generates `translated_nodes.json`.

8. **Inject translations**

   ```bash
   node inject_translations.js
   ```

   Generates the final `book_zh.html`.

## Configuration (`config.json`)

- `files.sourceHtml`: Source HTML file name
- `files.outputHtml`: Output HTML file name
- `files.textNodes`: Extracted nodes JSON file name
- `files.translatedNodes`: Translated results JSON file name
- `directories.batches`: Translation batch directory
- `directories.results`: Translation results directory
- `extraction.tags`: HTML tags to extract
- `translation.model`: LLM model name (e.g., gemini-1.5-pro)
- `translation.batchSize`: Number of paragraphs per batch

## Use Cases

- Large-scale HTML translation for technical books, tutorials, API docs, etc.
- Multilingual content migration with batch processing and automatic injection
- Any scenario requiring structured, traceable translation workflows

## Notes

- Do not commit `.env`, API keys, or generated intermediate files to Git
- Supports custom HTML tags, batch size, output paths, etc.
- Easily extensible to support various LLM APIs

## License

MIT
