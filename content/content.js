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

    let updateTimer = null; // 防抖定时器

    // 监听字幕文本变化
    const captionObserver = new MutationObserver(() => {
      // 防抖处理：清除之前的定时器
      if (updateTimer) {
        clearTimeout(updateTimer);
      }

      // 使用防抖，避免频繁更新
      updateTimer = setTimeout(() => {
        findAndDisplayCurrentSubtitle();
      }, 50);
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

    let transcriptUpdateTimer = null; // 防抖定时器
    let lastTranscriptUpdate = 0; // 上次更新时间

    // 监听沉浸式翻译插件生成的 font 元素变化
    transcriptObserver = new MutationObserver(() => {
      // 限流：如果上次更新在300ms内，跳过本次
      const now = Date.now();
      if (now - lastTranscriptUpdate < 300) {
        return;
      }

      // 使用防抖，避免频繁更新
      if (transcriptUpdateTimer) {
        clearTimeout(transcriptUpdateTimer);
      }

      transcriptUpdateTimer = setTimeout(() => {
        lastTranscriptUpdate = Date.now();
        findAndDisplayCurrentSubtitle();
      }, 200);
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

    if (!currentEnglishText) {
      // 如果字幕为空，隐藏翻译字幕
      const translatedSubtitle = document.querySelector('.packt-translated-subtitle');
      if (translatedSubtitle) {
        translatedSubtitle.style.display = 'none';
      }
      return;
    }

    // 正常映射逻辑
    return mapSubtitleToTranslation(currentEnglishText, transcriptBody);
  }

  // 字幕映射的核心逻辑
  function mapSubtitleToTranslation(englishText, transcriptBody) {
    console.log('🔍 开始映射字幕:', englishText);

    // 步骤1: 在原始英文 span 中查找匹配当前字幕的元素
    const englishSpans = transcriptBody.querySelectorAll(':scope > span[data-start]');
    let matchedIndex = -1;
    let matchedDataStart = null;

    for (let i = 0; i < englishSpans.length; i++) {
      const spanText = englishSpans[i].textContent.trim();
      if (spanText === englishText) {
        matchedIndex = i;
        matchedDataStart = englishSpans[i].getAttribute('data-start');
        console.log('✅ 完全匹配:', spanText, 'index:', i, 'data-start:', matchedDataStart);
        break;
      }
    }

    if (matchedIndex === -1) {
      // 没有完全匹配，尝试部分匹配
      for (let i = 0; i < englishSpans.length; i++) {
        const spanText = englishSpans[i].textContent.trim();
        if (englishText.includes(spanText) || spanText.includes(englishText)) {
          matchedIndex = i;
          matchedDataStart = englishSpans[i].getAttribute('data-start');
          console.log('⚠️ 部分匹配:', spanText, 'index:', i, 'data-start:', matchedDataStart);
          break;
        }
      }
    }

    if (matchedIndex === -1) {
      console.log('❌ 未找到匹配的英文字幕:', englishText);
      console.log('可用的英文字幕:', Array.from(englishSpans).map(s => s.textContent.trim()));
      return;
    }

    // 步骤2: 在沉浸式翻译生成的 font 结构中查找对应的中文翻译
    const translationWrapper = transcriptBody.querySelector('font.immersive-translate-target-wrapper');
    if (!translationWrapper) {
      console.log('❌ 未找到沉浸式翻译内容，请确保沉浸式翻译插件已启用');
      return;
    }

    // 在翻译区域查找所有带 data-start 属性的 span
    const translatedSpans = translationWrapper.querySelectorAll('span[data-start]');
    console.log('🈲 找到的中文翻译数量:', translatedSpans.length);

    let translatedText = '';

    // 方法1: 通过 data-start 属性精确匹配（最准确）
    if (matchedDataStart) {
      for (const span of translatedSpans) {
        if (span.getAttribute('data-start') === matchedDataStart) {
          translatedText = span.textContent.trim();
          console.log('✅ 通过 data-start 匹配到翻译:', translatedText);
          break;
        }
      }
    }

    // 方法2: 如果方法1失败，使用索引匹配
    if (!translatedText && translatedSpans[matchedIndex]) {
      translatedText = translatedSpans[matchedIndex].textContent.trim();
      console.log('⚠️ 通过索引匹配到翻译:', translatedText);
    }

    // 方法3: 如果还是没有，尝试查找包含中文的 span
    if (!translatedText) {
      for (const span of translatedSpans) {
        const text = span.textContent.trim();
        if (/[\u4e00-\u9fa5]/.test(text)) {
          translatedText = text;
          console.log('⚠️ 通过中文检测匹配到翻译:', translatedText);
          break;
        }
      }
    }

    // 显示翻译后的字幕
    if (translatedText) {
      displayTranslatedSubtitle(translatedText);
      console.log('🎯 最终字幕映射:', englishText, '->', translatedText);
    } else {
      console.log('❌ 未找到对应的中文翻译');
      console.log('所有可用的中文翻译:', Array.from(translatedSpans).map(s => s.textContent.trim()));
    }
  }

  // 创建用于显示翻译字幕的元素
  function createTranslatedSubtitleElement() {
    const captionWindow = document.querySelector('.caption-window');
    if (!captionWindow) {
      console.log('未找到 .caption-window 元素');
      return;
    }

    // 检查是否已经创建了翻译字幕容器
    if (document.querySelector('.packt-translated-subtitle-container')) {
      return;
    }

    // 创建一个独立的翻译字幕容器，放在原生字幕的正下方
    const translatedContainer = document.createElement('div');
    translatedContainer.className = 'packt-translated-subtitle-container';
    translatedContainer.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      text-align: center;
      pointer-events: none;
      z-index: 1000;
    `;

    // 创建翻译字幕元素
    const translatedSubtitle = document.createElement('div');
    translatedSubtitle.className = 'packt-translated-subtitle';
    translatedSubtitle.style.cssText = `
      display: none;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      font-size: 18px;
      line-height: 1.4;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      border-radius: 2px;
      margin: 0 auto;
      max-width: 90%;
      word-wrap: break-word;
    `;

    translatedContainer.appendChild(translatedSubtitle);
    captionWindow.appendChild(translatedContainer);

    console.log('✅ 翻译字幕容器已创建');
  }

  // 显示翻译后的字幕
  function displayTranslatedSubtitle(text) {
    if (!text) return;

    const translatedSubtitle = document.querySelector('.packt-translated-subtitle');
    if (!translatedSubtitle) {
      console.log('未找到翻译字幕容器');
      return;
    }

    // 直接更新翻译字幕内容
    translatedSubtitle.textContent = text;
    translatedSubtitle.style.display = 'inline-block';

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

      if (!isEnabled) {
        // 隐藏翻译字幕
        const translatedSubtitle = document.querySelector('.packt-translated-subtitle');
        if (translatedSubtitle) {
          translatedSubtitle.style.display = 'none';
        }
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
