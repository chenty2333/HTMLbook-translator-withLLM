# HTML Semantic Translation Batch Processing Tool

> **⚠️ Important Limitation: This tool is only suitable for books or documents with all content in a single HTML file. It does not currently support e-book projects with navigation bars, table of contents pages, or multi-page structures.**

> 📥 If you need to quickly obtain HTML files, please refer to the [HTML File Download Guide](#html-file-download-guide) later in this document. (CTRL+Right-click to jump to the corresponding section)

[中文 README](README.md)

## Environment Requirements

- Node.js ≥ 18 (Recommended v24.4.1)

- npm ≥ 8 (Recommended 11.4.2)

This project has locked dependency versions, so you can directly run `npm install` to reproduce the environment.

This project is a universal HTML semantic content batch translation and injection tool, suitable for high-quality automatic translation of large-volume HTML files such as technical documentation and e-books.

> **Note: After translation is completed, please manually check and modify the header information of the generated HTML file (such as `lang`, `title`, `meta` tags, etc.) to ensure that page language, title, author and other information are consistent with the target language. For example:
>
> ```html
> <!DOCTYPE html>
> <html xmlns="http://www.w3.org/1999/xhtml" lang="en-US" xml:lang="en-US">
> <head>
>   <meta charset="utf-8">
>   <meta name="generator" content="pandoc">
>   <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
>   <meta name="author" content="Rui Ueyama &lt;ruiu@cs.stanford.edu&gt;">
>   <meta name="dcterms.date" content="2020-03-16">
>   <title>Introduction to C Compiler for Low-level Developers</title>
>   ...
> ```
>
> This ensures that the final page is correctly displayed as the target language in browsers and search engines.

## Main Features

- Automatically extract semantic text blocks from HTML files (such as paragraphs, headings, lists, etc.)
- Support for batch generation of translation prompts, facilitating bulk processing by large model APIs
- Automatically merge translation results, maintaining one-to-one correspondence between numbering and original text
- One-click injection of translation content into original HTML, preserving original structure and formatting
- All parameters configurable through `config.json`, supporting multi-project reuse

## Directory Structure

```
├── input/                    # Source HTML file directory (input/index_.html)
├── output/                   # Output translated HTML file directory (output/output.html)
├── intermediate/             # Intermediate files directory
│   └── translation.db        # SQLite database (contains all intermediate data and results)
├── config.json               # Global configuration file, defining paths and parameters
├── src/                      # Script source code directory
│   ├── db.js                 # Database API module
│   ├── semantic_extractor.js # Semantic node extraction script
│   ├── build_prompts.js      # Build translation batch script
│   ├── translate_gemini.js   # Gemini API batch translation script
│   ├── merge_translation.js  # Merge translation results script
│   └── inject_translations.js# Inject translation content script
└── .gitignore
```

## Script Description

- **db.js**: Database API module, responsible for creating SQLite database connections, initializing table structures, and providing CRUD interfaces.
- **semantic_extractor.js**: Extracts semantic text nodes from HTML files, generates unique IDs and XPaths, and writes results to the `text_nodes` table.
- **build_prompts.js**: Reads nodes from the `text_nodes` table, generates numbered batches according to `batchSize`, and writes to the `prompt_batches` table.
- **translate_gemini.js**: Reads batch prompts from the `prompt_batches` table, calls Gemini API for translation, and writes to the `batch_translations` table.
- **merge_translation.js**: Reads translation results from the `batch_translations` table, parses line numbers and translations, and writes translations to the `translated_nodes` table.
- **inject_translations.js**: Reads all translation content from the `translated_nodes` table, uses Puppeteer to inject translations into the original HTML, and outputs the final HTML file.

## Quick Start

### ❗Configuration Prerequisites

Before starting to use the scripts, please first edit `config.json`:
- Set `files.sourceHtml` to the path of the HTML file to be translated (e.g., `input/index.html`);
- You can modify `database.path` to the corresponding SQLite database filename (e.g., `intermediate/yourfile.db`) to achieve independent translation processes for different source files.
- See the parameter configuration method in the `Configuration Description` section below for details.

### Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure API Key**

   Create a `.env` file and set `GEMINI_API_KEY` equal to your API key.

3. **Extract Semantic Nodes**

   ```bash
   node src/semantic_extractor.js
   ```

   Generates `text_nodes.json`.

4. **Build Translation Batches**

   ```bash
   node src/build_prompts.js
   ```

   Generates batch files in the `batches/` directory.

5. **Batch Translation**

   ```bash
   node src/translate_gemini.js
   ```

   Results are saved in the `results/` directory.

6. **Merge Translation Results**

   ```bash
   node src/merge_translation.js
   ```

   Generates `translated_nodes.json`.

7. **Inject Translation Content**

   ```bash
   node src/inject_translations.js
   ```

   Generates the final output to the location specified in `config.json`.

## Configuration Description (config.json)

- `files.sourceHtml`: Source HTML file path, relative to project root directory, e.g., `input/index_.html`
- `files.outputHtml`: Output HTML file path, relative to project root directory, e.g., `output/output.html`
- `directories.batches`: Batch directory (for compatibility with old configurations, actually managed by database)
- `directories.results`: Results directory (for compatibility with old configurations, actually managed by database)
- `translation.model`: Large model name, e.g., `gemini-2.5-flash-lite`
- `translation.batchSize`: Number of paragraphs per batch for translation, adjust as needed
- `database.path`: SQLite database file path, relative to project root directory, e.g., `intermediate/translation.db`

- ❗`extraction.tags`: HTML tags to be extracted, can be modified according to requirements, recommended to keep default. Extraction of some tags may cause translation format issues, such as `<code>` tags, can be tried

## ❓ FAQ
1. How to translate multiple files?
   - Modify `files.sourceHtml` and `database.path` in `config.json`, then repeat the process.

## Use Cases

- Technical books, tutorials, API documentation and other large-volume HTML translation
- Bulk processing and automatic injection for multilingual content migration
- Any scenario requiring structured and traceable translation processes

## Notes

- This tool is only suitable for books or documents with all content in a single HTML file, and does not support e-book projects with navigation bars, table of contents pages, or multi-page structures.
- Do not commit `.env`, API keys, or generated intermediate files to Git repository
- Supports custom HTML tags, batch sizes, output paths, etc.
- Supports multiple large model APIs (extensible)

## License

MIT



---



## HTML File Download Guide

You can use the [`wget`](https://www.gnu.org/software/wget/) tool to batch download web content, including HTML files and their related resources. This section briefly introduces common usage of `wget`.

### Complete Download of Single Web Page

If you only need to download a single web page and its required resources, you can use the following command:

```bash
wget --convert-links --adjust-extension --page-requisites --no-parent https://example.com/
```

(Replace `https://example.com/` with the website link you want to download)

**Parameter Description:**

- `--convert-links`: Automatically correct links in local HTML for convenient offline browsing.
- `--adjust-extension`: Automatically complete file extensions (such as `.html`) based on content type.
- `--page-requisites`: Download all resources required by the page (images, CSS, JS, etc.).
- `--no-parent`: Only download current directory and subdirectories, not parent directories.

After execution, HTML files and resource folders for the page will be generated in the current directory, which can be opened locally for browsing.

### Recursive Download of Entire Website or Directory

If you need to download multiple HTML pages while preserving the website directory structure, you can add recursive parameters:

```bash
wget -r --convert-links --adjust-extension --page-requisites --no-parent https://example.com/
```

- `-r` or `--recursive`: Recursively crawl all linked pages, downloading multi-page content.
- The download result will generate a folder with the website domain as the root directory, preserving the original website structure.

**Example Directory Structure:**

```
example.com/
  ├── index.html
  ├── page1.html
  ├── assets/
  └── ...
```

If you need to limit recursive depth, you can use `-l 2` to control crawl levels:

```bash
wget -r -l 2 --convert-links --adjust-extension --page-requisites --no-parent https://example.com/
```

### Other Notes

- `wget` cannot completely crawl some modern sites that depend on JS dynamic rendering, and is only suitable for static web content.
- It is recommended to follow the target website's crawler policy, download reasonably, and avoid excessive crawling.

For more `wget` usage, please refer to the official documentation or `wget --help`.
