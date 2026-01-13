# pdfoxjs

> View and edit PDF documents with customisable VIM keyboard shortcuts

Cross-platform electron wrapper around Mozilla's [pdf.js](https://mozilla.github.io/pdf.js).

Support features present in the [pdf.js v5.4.530](https://github.com/mozilla/pdf.js/releases/tag/v5.4.530) release.

## Installation

See the latest release at
- https://github.com/nktnet1/pdfoxjs/releases/latest

| Operating System | File Extension | Example (vX.X.X) |
|-|-|-|
| Linux  | AppImage | pdfoxjs-X.X.X.AppImage |
| MacOS  | dmg  | pdfoxjs-X.X.X.dmg  |
| Windows  | exe  | pdfoxjs-Setup-X.X.X.exe  |

## Features

Please refer to the original documentation of [pdf.js](https://github.com/mozilla/pdf.js). There is also a demo for modern browsers released by Mozilla [here](https://mozilla.github.io/pdf.js/web/viewer.html).

![Tools View](public/help.png)

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
    - Go to First Page
    - Go to Last Page
    - Rotate Clockwise
    - Rotate Counterclockwise
    - Text Selection Tool
    - Hand Selection Tool
    - Page Scrolling
    - Vertically Scrolling
    - Horizontal Scrolling
    - Wrapped Scrolling
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

### Example PDF

The file [public/demo.pdf](public/demo.pdf) is a good playground to showcase the features from the viewer.

It is a merged PDF from the following sources:
- Form: https://royalegroupnyc.com/wp-content/uploads/seating_areas/sample_pdf.pdf
- Layer: https://www.pdfill.com/example/pdf_layer_new.pdf
- Attachment: https://demos.devexpress.com/OfficeFileAPI/ASP/ContentManipulation/PdfFileAttachment.aspx

By default, you can use the double quotation marks key (`"`, i.e. `SHIFT` + `'`) to load this document.

### Configuration

See [public/default.json](public/default.json) for an example configuration file. This will contain all defined functions and corresponding settings.

On the initial launch, the default configuration will be copied to the directory `userConfig/config.json`, which will be within [Electron app's userData directory](https://www.electronjs.org/docs/latest/api/app#appgetpathname).

On Linux, for a particular `username`, this could be one of:
```
/home/username/.config/pdfoxjs/userConfig/config.json
/home/username/.pdfoxjs/userConfig/config.json
```
depending on how your [XDG_CONFIG_HOME](https://wiki.archlinux.org/title/XDG_Base_Directory#User_directories) is defined.

On MacOS, it will be
```
~/Library/Application Support/pdfoxjs/userConfig/config.json
```

On Windows, it will be
```
%APPDATA%\pdfoxjs\userConfig\config.json
```

## Project Setup (Development)

### Setup

```bash
$ pnpm install
```

### Development

```bash
# Transpile and run an electron app
$ pnpm start

# Simple express server on localhost
$ pnpm dev
```

### Build

```bash
# For Windows
$ pnpm build:win

# For MacOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
