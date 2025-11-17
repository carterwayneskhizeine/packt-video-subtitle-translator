// 内容脚本 - 字幕实时映射（复用沉浸式翻译结果）

(function() {
  'use strict';

  let isEnabled = true;
  let settings = null;
  let transcriptObserver = null;
  let translatedSubtitleElement = null;

  // 初始化
  async function init() {
    console.log('🎯 Packt 字幕映射插件初始化...');

    settings = await StorageManager.getSettings();
    isEnabled = settings.enabled;

    if (!isEnabled) {
      console.log('字幕映射功能已禁用');
      return;
    }

    // 添加控制按钮
    addControlButton();

    // 等待视频和字幕元素加载
    Promise.all([
      waitForElement('.caption-text'),
      waitForElement('.reader-video-transripts-body')
    ]).then(() => {
      console.log('✅ 视频字幕和翻译区域已加载');
      createTranslatedSubtitleElement();
      startCaptionTextTracking();
      startTranscriptTracking();
    });
  }

  // 等待元素出现
  function waitForElement(selector) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  // 监听视频字幕显示区域（.caption-text）的变化
  function startCaptionTextTracking() {
    const captionText = document.querySelector('.caption-text');
    if (!captionText) {
      console.log('未找到 .caption-text 元素');
      return;
    }

    console.log('📺 开始监听视频字幕变化...');

    // 监听字幕文本变化
    const captionObserver = new MutationObserver(() => {
      findAndDisplayCurrentSubtitle();
    });

    captionObserver.observe(captionText, {
      characterData: true,
      childList: true,
      subtree: true
    });

    // 初始加载时也触发一次
    findAndDisplayCurrentSubtitle();
  }

  // 监听字幕文本变化
  function startTranscriptTracking() {
    const transcriptBody = document.querySelector('.reader-video-transripts-body');
    if (!transcriptBody) return;

    console.log('📜 开始监听字幕翻译区域变化...');

    // 监听沉浸式翻译插件生成的 font 元素变化
    transcriptObserver = new MutationObserver(() => {
      // 字幕文本有更新时重新查找当前字幕
      findAndDisplayCurrentSubtitle();
    });

    transcriptObserver.observe(transcriptBody, {
      childList: true,
      subtree: true
    });
  }

  // 根据当前播放时间查找并显示对应的字幕
  function findAndDisplayCurrentSubtitle() {
    if (!isEnabled) return;

    const transcriptBody = document.querySelector('.reader-video-transripts-body');
    const captionText = document.querySelector('.caption-text');

    if (!transcriptBody || !captionText) return;

    // 获取视频当前显示的英文字幕
    const currentEnglishText = captionText.textContent.trim();
    if (!currentEnglishText) return;

    // 查找沉浸式翻译生成的翻译内容
    // 结构: <div class="reader-video-transripts-body">
    //   <span data-start="6" data-end="7">Welcome to this lecture.</span>
    //   ...更多英文 span...
    //   <font class="notranslate immersive-translate-target-wrapper">
    //     <font>
    //       <font>
    //         <span data-start="6" data-end="7">欢迎来到本次讲座。</span>
    //         ...更多中文 span...
    //       </font>
    //     </font>
    //   </font>
    // </div>

    // 步骤1: 在原始英文 span 中查找匹配当前字幕的元素
    const englishSpans = transcriptBody.querySelectorAll(':scope > span[data-start]');
    let matchedIndex = -1;
    let matchedDataStart = null;

    for (let i = 0; i < englishSpans.length; i++) {
      const englishText = englishSpans[i].textContent.trim();
      if (englishText === currentEnglishText) {
        matchedIndex = i;
        matchedDataStart = englishSpans[i].getAttribute('data-start');
        break;
      }
    }

    if (matchedIndex === -1) {
      // 没有完全匹配，尝试部分匹配
      for (let i = 0; i < englishSpans.length; i++) {
        const englishText = englishSpans[i].textContent.trim();
        if (currentEnglishText.includes(englishText) || englishText.includes(currentEnglishText)) {
          matchedIndex = i;
          matchedDataStart = englishSpans[i].getAttribute('data-start');
          break;
        }
      }
    }

    if (matchedIndex === -1) {
      console.log('未找到匹配的英文字幕:', currentEnglishText);
      return;
    }

    // 步骤2: 在沉浸式翻译生成的 font 结构中查找对应的中文翻译
    const translationWrapper = transcriptBody.querySelector('font.immersive-translate-target-wrapper');
    if (!translationWrapper) {
      console.log('未找到沉浸式翻译内容，请确保沉浸式翻译插件已启用');
      return;
    }

    // 在翻译区域查找所有带 data-start 属性的 span
    const translatedSpans = translationWrapper.querySelectorAll('span[data-start]');

    let translatedText = '';

    // 方法1: 通过 data-start 属性精确匹配
    if (matchedDataStart) {
      for (const span of translatedSpans) {
        if (span.getAttribute('data-start') === matchedDataStart) {
          translatedText = span.textContent.trim();
          break;
        }
      }
    }

    // 方法2: 如果方法1失败，使用索引匹配
    if (!translatedText && translatedSpans[matchedIndex]) {
      translatedText = translatedSpans[matchedIndex].textContent.trim();
    }

    // 方法3: 如果还是没有，尝试查找包含中文的 span
    if (!translatedText) {
      for (const span of translatedSpans) {
        const text = span.textContent.trim();
        if (/[\u4e00-\u9fa5]/.test(text)) {
          translatedText = text;
          break;
        }
      }
    }

    // 显示翻译后的字幕
    if (translatedText) {
      displayTranslatedSubtitle(translatedText);
      console.log('✅ 字幕映射:', currentEnglishText, '->', translatedText);
    } else {
      console.log('未找到对应的中文翻译');
    }
  }

  // 创建用于显示翻译字幕的元素
  function createTranslatedSubtitleElement() {
    if (translatedSubtitleElement) return;

    const captionWindow = document.querySelector('.caption-window');
    if (!captionWindow) {
      console.log('未找到 .caption-window 元素');
      return;
    }

    translatedSubtitleElement = document.createElement('div');
    translatedSubtitleElement.id = 'packt-translated-subtitle';
    translatedSubtitleElement.style.cssText = `
      color: #FFD700 !important;
      background-color: rgba(0, 0, 0, 0.8) !important;
      padding: 8px 12px !important;
      margin-top: 6px !important;
      font-size: 100% !important;
      border-radius: 4px !important;
      font-weight: 600 !important;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9) !important;
      line-height: 1.4 !important;
      letter-spacing: 0px !important;
      display: none !important;
    `;

    captionWindow.appendChild(translatedSubtitleElement);
    console.log('✅ 翻译字幕显示元素已创建');
  }

  // 显示翻译后的字幕
  function displayTranslatedSubtitle(text) {
    if (!translatedSubtitleElement || !text) return;

    translatedSubtitleElement.textContent = text;
    translatedSubtitleElement.style.display = text ? 'block' : 'none';

    console.log('📝 显示翻译字幕:', text);
  }

  // 添加控制按钮
  function addControlButton() {
    const controls = document.querySelector('.controls');
    if (!controls) return;

    const button = document.createElement('button');
    button.id = 'subtitle-translator-toggle';
    button.style.cssText = `
      background: ${isEnabled ? '#4CAF50' : '#f44336'};
      color: white;
      border: none;
      padding: 6px 12px;
      margin-left: 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
    `;
    button.textContent = isEnabled ? '字幕映射: 开' : '字幕映射: 关';
    button.title = '切换字幕映射（复用沉浸式翻译结果）';

    button.addEventListener('click', async () => {
      isEnabled = !isEnabled;
      button.textContent = isEnabled ? '字幕映射: 开' : '字幕映射: 关';
      button.style.background = isEnabled ? '#4CAF50' : '#f44336';

      settings.enabled = isEnabled;
      await StorageManager.saveSettings(settings);

      if (!isEnabled && translatedSubtitleElement) {
        translatedSubtitleElement.style.display = 'none';
      } else {
        findAndDisplayCurrentSubtitle();
      }
    });

    controls.appendChild(button);
    console.log('🎛️ 控制按钮已添加');
  }

  // 监听设置变化
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.settings) {
      settings = changes.settings.newValue;
      isEnabled = settings.enabled;

      const button = document.getElementById('subtitle-translator-toggle');
      if (button) {
        button.textContent = isEnabled ? '字幕映射: 开' : '字幕映射: 关';
        button.style.background = isEnabled ? '#4CAF50' : '#f44336';
      }

      console.log('设置已更新:', settings);
    }
  });

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('🚀 Packt 字幕映射插件已加载（复用沉浸式翻译结果）');
})();
