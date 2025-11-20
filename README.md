# 📺 Packt 视频字幕实时同步器

一个 Chrome 浏览器插件，可以实时将 Packt 订阅平台的视频字幕区域翻译内容同步显示到视频画面中。

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特点

- 🔄 **即时同步** - 零延迟，实时同步沉浸式翻译结果到视频画面
- ⚡ **无需 API** - 复用沉浸式翻译插件，无需配置翻译 API
- 🎯 **智能匹配** - 自动匹配当前播放的字幕行
- 🎨 **美观显示** - 自定义样式，字幕醒目显示
- 📐 **字幕自定义** - 调节垂直偏移（-50~+50px）和字体大小（10~40px）
- 🎛️ **灵活控制** - 视频页面内置开关，随时启用/禁用同步
- 🔒 **安全可靠** - 仅在本地运行，不发送数据到外部服务器

## 📦 安装前准备

### 必需条件

1. **安装沉浸式翻译插件**
   - 访问 Chrome 网上应用店
   - 搜索并安装"沉浸式翻译"插件
   - 配置插件翻译为中文（目标语言）

2. **确保沉浸式翻译正常工作**
   - 访问 [Packt 订阅平台](https://subscription.packtpub.com/)
   - 打开任意视频，确认字幕区域已被翻译成中文
   - 检查字幕是否显示在右侧区域

## 📦 安装方法

### 从源码安装（开发者模式）

1. **下载源码**
   ```bash
   git clone https://github.com/yourusername/chrome-subtitle-translator.git
   cd chrome-subtitle-translator
   ```

2. **准备图标文件**（可选）
   - 图标文件已包含在 `icons/` 目录中
   - 或者暂时注释掉 `manifest.json` 中的 icons 配置

3. **加载插件到 Chrome**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `chrome-subtitle-translator` 文件夹

4. **完成！** 插件图标会出现在浏览器工具栏

## 🚀 5分钟快速开始

### 前提条件检查

在开始之前，请确保：
- [ ] 已安装 Chrome 浏览器（版本 88+）
- [ ] 有 Packt 订阅账号（或可以访问 Packt 视频页面）

### 第一步：安装沉浸式翻译插件（2 分钟）

1. 打开 Chrome 网上应用店
2. 搜索"沉浸式翻译"并安装
3. 安装后点击插件图标，确保：
   - 插件已启用
   - 目标语言设置为"中文"

**验证方法**：访问任意英文网页，看是否自动显示中文翻译

### 第二步：下载本插件（30 秒）

如果你还没有源码：
- 从 GitHub 下载 ZIP 并解压
- 或使用 Git：`git clone <repo-url>`

### 第三步：加载插件到 Chrome（1 分钟）

1. 打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `chrome-subtitle-translator` 文件夹

**注意**：如果提示缺少图标，可以：
- 忽略警告（不影响功能）
- 图标文件已包含在 `icons/` 目录中

### 第四步：测试功能（1 分钟）

1. 访问 Packt 视频页面
   例如：https://subscription.packtpub.com/video/...

2. 播放视频

3. 检查以下几点：
   - [ ] 右侧字幕区域显示中英文
   - [ ] 视频画面下方出现**中文字幕**
   - [ ] 中文字幕随视频播放实时更新

### 成功标志 ✅

如果你看到：
- 视频画面下方有**中文字幕**
- 字幕内容与视频同步
- 字幕内容与右侧翻译区域一致

**恭喜！安装成功！🎉**

## 📂 项目结构

```
chrome-subtitle-translator/
├── manifest.json              # Chrome 插件配置文件
├── popup/                     # 插件弹窗界面
│   ├── popup.html            # 设置页面 HTML
│   ├── popup.css             # 设置页面样式
│   └── popup.js              # 设置页面逻辑
├── content/                   # 内容脚本
│   └── content.js            # 字幕同步核心逻辑
├── utils/                     # 工具模块
│   ├── storage.js            # 存储管理
│   └── translator.js         # 翻译工具
├── icons/                     # 图标资源
│   ├── icon.svg              # SVG 源图标
│   ├── icon16.png            # 16x16 图标
│   ├── icon32.png            # 32x32 图标
│   ├── icon48.png            # 48x48 图标
│   └── icon128.png           # 128x128 图标
├── background/                # 后台脚本目录
├── debug-console.js          # 调试控制台脚本
└── README.md                 # 项目文档
```

## ⚙️ 技术实现

### 核心技术
- **MutationObserver API** - 监听 DOM 变化，检测字幕更新
- **Chrome Extension Manifest V3** - 最新版插件规范
- **Chrome Storage API** - 同步设置

### DOM 结构分析

Packt 视频页面结构：

```html
<!-- 视频画面字幕（当前播放） -->
<div class="caption-window">
  <div class="caption-text">Welcome to this lecture.</div>
</div>

<!-- 右侧字幕区域（完整文本） -->
<div class="reader-video-transripts-body">
  <!-- 原始英文字幕 -->
  <span data-start="6" data-end="7">Welcome to this lecture.</span>
  <span data-start="8" data-end="12">You might wonder who I am...</span>
  ...

  <!-- 沉浸式翻译生成的中文翻译 -->
  <font class="immersive-translate-target-wrapper">
    <font>
      <font>
        <span data-start="6" data-end="7">欢迎来到本次讲座。</span>
        <span data-start="8" data-end="12">您可能想知道我是谁...</span>
        ...
      </font>
    </font>
  </font>
</div>
```

### DOM 选择器

```javascript
// 视频字幕（当前播放）
.caption-text

// 字幕显示区域
.caption-window

// 字幕文本区域
.reader-video-transripts-body

// 英文字幕
.reader-video-transripts-body > span[data-start]

// 沉浸式翻译结果
font.immersive-translate-target-wrapper span[data-start]
```

### 匹配逻辑

```javascript
// 1. 获取当前视频字幕
const currentText = document.querySelector('.caption-text').textContent;

// 2. 在英文字幕列表中查找匹配
const englishSpans = document.querySelectorAll(
  '.reader-video-transripts-body > span[data-start]'
);

// 3. 通过文本匹配找到索引和 data-start 属性
let matchedIndex = -1;
let matchedDataStart = null;
for (let i = 0; i < englishSpans.length; i++) {
  if (englishSpans[i].textContent.trim() === currentText) {
    matchedIndex = i;
    matchedDataStart = englishSpans[i].getAttribute('data-start');
    break;
  }
}

// 4. 在沉浸式翻译的结果中查找对应的中文
const translationWrapper = document.querySelector(
  'font.immersive-translate-target-wrapper'
);
const translatedSpans = translationWrapper.querySelectorAll('span[data-start]');

// 5. 通过 data-start 属性精确匹配
let translatedText = '';
for (const span of translatedSpans) {
  if (span.getAttribute('data-start') === matchedDataStart) {
    translatedText = span.textContent.trim();
    break;
  }
}

// 6. 显示翻译
displayTranslatedSubtitle(translatedText);
```

### 同步流程
1. `MutationObserver` 监听 `.caption-text` 元素变化
2. 提取当前视频字幕文本
3. 在英文字幕列表中查找匹配的文本
4. 获取该字幕的 `data-start` 属性
5. 在沉浸式翻译结果中查找相同 `data-start` 的中文字幕
6. 提取中文翻译并显示到视频画面

### 字幕匹配策略
- **高亮行检测**：检测 Packt 字幕区域的当前高亮行
- **时间估算**：根据视频播放时间估算当前字幕位置
- **索引对应**：建立英文字幕行与翻译行的索引对应关系
- **三级匹配策略**：data-start 匹配 → 索引匹配 → 中文检测

## 📦 详细安装指南

### 安装步骤

#### 步骤 1: 安装沉浸式翻译插件

**方法 A：Chrome 网上应用店安装**

1. 访问 Chrome 网上应用店
2. 搜索"沉浸式翻译"或访问：[沉浸式翻译插件](https://chrome.google.com/webstore/detail/immersive-translate/bpoadfkcbjbfhfodiogcnhhhpibjhbnh)
3. 点击"添加到 Chrome"安装
4. 安装完成后，点击插件图标进入设置
5. 配置翻译目标语言为中文

**方法 B：确保沉浸式翻译正常工作**

1. 访问 [Packt 订阅平台](https://subscription.packtpub.com/)
2. 打开任意视频课程
3. 检查右侧字幕区域是否显示中英文
4. 确认能看到类似 `font > font > font > span` 的 HTML 结构

#### 步骤 2: 下载本插件源码

如果你还没有源码，可以通过以下方式获取：
- 从 GitHub 下载 ZIP 并解压
- 或者使用 Git 克隆：`git clone <repo-url>`

#### 步骤 3: 加载插件到 Chrome

1. **打开扩展管理页面**
   - 在地址栏输入：`chrome://extensions/`
   - 或点击：菜单 → 更多工具 → 扩展程序

2. **启用开发者模式**
   - 在页面右上角找到"开发者模式"开关
   - 点击开启

3. **加载插件**
   - 点击左上角"加载已解压的扩展程序"
   - 选择 `chrome-subtitle-translator` 文件夹
   - 点击"选择文件夹"

4. **验证安装**
   - 插件应该出现在扩展列表中
   - 名称：Packt 视频字幕实时同步器
   - 状态：已启用

#### 步骤 4: 启用字幕同步功能

1. **打开插件设置**
   - 点击浏览器工具栏的本插件图标
   - 或在 `chrome://extensions/` 中点击插件的"详细信息" → "扩展程序选项"

2. **配置插件**
   - ✅ 启用字幕同步：保持开启
   - 💾 点击"保存设置"

3. **功能说明**
   - 本插件无需配置 API，复用沉浸式翻译结果
   - 只在本地运行，不发送数据到外部服务器

#### 步骤 5: 测试同步功能

1. **访问 Packt 视频页面**
   - 登录 https://subscription.packtpub.com/
   - 打开任意视频课程
   - 例如：https://subscription.packtpub.com/video/...

2. **播放视频**
   - 点击播放按钮
   - 确保字幕已启用

3. **检查同步效果**
   - 视频画面下方应该显示中文翻译字幕
   - 字幕显示（样式可自定义）
   - 视频控制栏会有"Subtitle: On"按钮

4. **调试（如果不工作）**
   - 按 F12 打开开发者工具
   - 切换到 Console 标签
   - 查找"🎯 Packt 字幕映射插件初始化..."日志
   - 查看是否有错误信息（红色）

## 🔧 常见问题解答

### Q: 字幕没有同步显示？
A: 检查以下几点：
1. 沉浸式翻译插件是否正常工作
2. 本插件功能是否已启用（检查视频页面的开关按钮）
3. 打开浏览器控制台（F12），查看是否有错误信息
4. 刷新视频页面重试

### Q: 同步有延迟？
A: 本插件无翻译延迟（因为是提取式同步），如果感觉延迟可能是：
1. 沉浸式翻译插件本身的翻译延迟
2. 网络连接问题

### Q: 支持其他视频网站吗？
A: 目前仅支持 Packt 订阅平台。如需支持其他网站，需要：
1. 修改 `manifest.json` 中的 `matches` 规则
2. 调整 `content.js` 中的字幕元素选择器
3. 适配目标网站的 DOM 结构

### Q: 如何临时禁用同步？
A: 点击视频控制栏的"Subtitle: On/Off"按钮即可

**依赖要求**：
- ✅ **新增依赖**: 必须先安装"沉浸式翻译" Chrome 插件
- ✅ **前置条件**: 沉浸式翻译需要正常工作并翻译字幕区域

#### 技术细节

**修改的文件**:
- `content/content.js`: 重写字幕查找和匹配逻辑，调整字幕位置
- `popup/popup.html`: 简化设置界面，移除 API 配置
- `popup/popup.js`: 移除 API 相关代码
- `utils/storage.js`: 简化存储结构
- `utils/translator.js`: 保留翻译工具类
- `manifest.json`: 更新描述和版本号
- `background/`: 添加后台脚本支持

#### 已知问题

1. **依赖沉浸式翻译**
   - 如果沉浸式翻译未安装或未启用，本插件无法工作
   - 沉浸式翻译 DOM 结构变化可能导致匹配失败

2. **匹配准确性**
   - 依赖 `data-start` 属性进行精确匹配
   - 如果沉浸式翻译修改了属性，可能需要调整代码

## 🛠️ 开发指南

### 调试方法
1. 在 `chrome://extensions/` 页面找到插件
2. 在视频页面按 F12 打开开发者工具，查看控制台日志
3. 搜索日志中的 `[Packt 字幕映射]` 前缀查看插件输出

### 修改代码后
1. 在 `chrome://extensions/` 页面点击插件的"重新加载"按钮
2. 刷新视频页面测试

## 🔄 更新与卸载

### 更新插件

当插件代码更新后：

1. 修改代码文件
2. 在 `chrome://extensions/` 页面找到插件
3. 点击插件右下角的"重新加载"图标（圆形箭头）
4. 刷新视频页面测试

### 卸载插件

1. 访问 `chrome://extensions/`
2. 找到"Packt 视频字幕实时同步器"
3. 点击"移除"
4. 确认删除

**注意**：卸载会删除插件设置

## 📄 许可证

MIT License - 自由使用、修改和分发

## 🙏 致谢

- Packt 提供优质技术课程
- 沉浸式翻译插件提供优秀的翻译功能

---

**免责声明**：本插件仅供学习交流使用，请遵守相关平台的服务条款。
