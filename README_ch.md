<img src="./images/Image-Link-Preview-banner.png">

<div align="center" style="margin-bottom:12px">
  <a href="README.md">한국어</a> | 
  <a href="README_en.md">English</a> | 
  <a href="README_jp.md">日本語</a> | 
  <a href="README_ch.md">中文</a>
</div>

---

此Chrome扩展程序可检测网页内容中的图像URL，并在鼠标悬停时显示预览。

## 功能

- 自动检测网页中的图像URL（.jpg、.png、.gif、.jpeg扩展名）
- 鼠标悬停在图像URL上时显示预览
- 适用于动态加载的内容
- 自动调整图像大小
- 扩展程序启用/禁用功能
- 预览时显示原始图像尺寸（宽 x 高）
- 多语言支持（韩语、英语、日语、中文）

## 支持的功能

此扩展程序支持各种类型的图像URL：

1. **简单图像URL**：支持基本图像URL（例如，https://example.com/image.jpg）
2. **各种图像格式**：支持不同的图像格式，包括PNG、GIF和JPEG
3. **文本中的图像URL**：检测并为嵌入文本中的图像URL提供预览
4. **带查询参数的URL**：支持包含查询字符串的图像URL（例如，image.jpg?text=HelloWorld&font=roboto）
5. **指定颜色的图像**：支持具有指定背景和文本颜色的图像URL
6. **Picsum随机图像**：支持如picsum.photos之类的随机图像服务URL
7. **动态添加的内容**：检测并为页面加载后通过JavaScript动态添加的图像URL提供预览

## 安装方法

1. 下载或克隆此仓库
2. 在Chrome浏览器中访问 `chrome://extensions/`
3. 启用开发者模式（右上角）
4. 点击"加载已解压的扩展程序"
5. 选择下载的文件夹

## 使用方法

- 安装扩展程序后，只需将鼠标悬停在任何网页上的图像URL上即可查看图像预览
- 预览底部会显示原始图像的实际尺寸（以像素为单位）
- 点击扩展程序图标打开弹出窗口，可以启用或禁用扩展程序
- 禁用时，图像URL检测和预览功能将不会工作 