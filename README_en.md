<img src="./images/Image-Link-Preview-banner.png">

<div align="center" style="margin-bottom:12px">
  <a href="README.md">한국어</a> | 
  <a href="README_en.md">English</a> | 
  <a href="README_jp.md">日本語</a> | 
  <a href="README_ch.md">中文</a>
</div>

---

This Chrome extension detects image URLs in web page content and displays a preview when you hover over them.

## Features

- Automatic detection of image URLs in web pages (.jpg, .png, .gif, .jpeg extensions)
- Preview display when hovering over image URLs
- Works with dynamically loaded content
- Automatic image size adjustment
- Extension enable/disable functionality
- Display of original image dimensions (width x height) with preview
- Multi-language support (Korean, English, Japanese, Chinese)

## Supported Features

This extension supports various types of image URLs:

1. **Simple Image URLs**: Basic image URLs are supported (e.g., https://example.com/image.jpg)
2. **Various Image Formats**: Supports different image formats including PNG, GIF, and JPEG
3. **Image URLs Within Text**: Detects and provides previews for image URLs embedded within text
4. **URLs With Query Parameters**: Supports image URLs that include query strings (e.g., image.jpg?text=HelloWorld&font=roboto)
5. **Color-Specified Images**: Supports image URLs with specified background and text colors
6. **Picsum Random Images**: Supports random image service URLs like picsum.photos
7. **Dynamically Added Content**: Detects and provides previews for image URLs added dynamically via JavaScript after the page has loaded

## Installation

1. Download or clone this repository
2. Go to `chrome://extensions/` in your Chrome browser
3. Enable Developer Mode (top right)
4. Click "Load unpacked extension"
5. Select the downloaded folder

## How to Use

- After installing the extension, simply hover over an image URL on any webpage to see a preview of the image
- The actual dimensions of the original image (in pixels) are displayed at the bottom of the preview
- Click the extension icon to open a popup that allows you to enable or disable the extension
- When disabled, the image URL detection and preview functionality will not work 