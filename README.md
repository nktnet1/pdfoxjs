# pdfjs-standalone

> View and edit PDF documents

Cross-platform electron wrapper around Mozilla's [pdf.js](https://mozilla.github.io/pdf.js).

Support features present in the [pdf.js v4.0.189](https://github.com/mozilla/pdf.js/releases/tag/v4.0.189) release.

## Features

Please refer to the original documentation of [pdf.js](https://github.com/mozilla/pdf.js). There is also a demo for modern browsers released by Mozilla [here](https://mozilla.github.io/pdf.js/web/viewer.html). Below is a summarised list.

![Tools View](src/renderer/assets/tools-view.png)

### Toolbar
- Toggle Sidebar
- Find in Document (Search)
- Page Selection
- Zoom
- Open File
- Print
- Save (Download)
    - This Includes Text, Drawing/Annotation, Filled Form Inputs, and Inserted Images
    - Page Rotations Are Not Saved
- Insert Text
- Draw (Annotate)
- Add/Edit Images
- Tools
    - Presentation Mode
    ---
    - Go to First Page
    - Go to Last Page
    ---
    - Rotate Clockwise
    - Rotate Counterclockwise
    ---
    - Text Selection Tool
    - Hand Selection Tool
    ---
    - Page Scrolling
    - Vertically Scrolling
    - Horizontal Scrolling
    - Wrapped Scrolling
    ---
    - No Spread
    - Odd Spread
    - Even Spread

### Sidebar
- Show Thumbnails
- Show Document Outline
- Show Attachments
- Show Layers

### Viewer

- Select Text
    - Copy
    - Search with Google
    - Inspect (only in development mode)
- Open Links (will open a new tab in your default browser)
- Fill Forms
    - `<TAB>` and `<SHIFT-TAB>` to navigate forward and backward between form inputs
    - `<SPACE>` inside checkbox to toggle selection
    - `<ENTER>` in multi-lines input box for new lines


## Project Setup (Development)

This project is built using

- [electron-vite](https://electron-vite.org)
- [react](https://react.dev)
- [typescript](https://www.typescriptlang.org)

The main packages used are
- [pdfjs-dist](https://github.com/mozilla/pdfjs-dist) (prebuilt binary embedded in src/renderer)
- [pdfjs-viewer-element](https://github.com/alekswebnet/pdfjs-viewer-element)
- [electron-context-menu](https://github.com/sindresorhus/electron-context-menu)

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```
