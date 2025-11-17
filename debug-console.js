/**
 * 浏览器控制台调试脚本
 * 
 * 使用方法：
 * 1. 打开 Packt 视频页面
 * 2. 按 F12 打开开发者工具
 * 3. 切换到 Console 标签
 * 4. 复制粘贴此脚本并执行
 * 
 * 这个脚本会帮你检查：
 * - 关键元素是否存在
 * - DOM 结构是否符合预期
 * - 字幕匹配逻辑是否正确
 */

(function() {
  console.log('=== 🔍 Packt 字幕插件调试工具 ===\n');

  // 1. 检查关键元素
  console.log('1️⃣ 检查关键元素:');
  
  const captionText = document.querySelector('.caption-text');
  console.log('  .caption-text:', captionText ? '✅ 存在' : '❌ 不存在');
  if (captionText) {
    console.log('    当前字幕:', captionText.textContent.trim());
  }

  const captionWindow = document.querySelector('.caption-window');
  console.log('  .caption-window:', captionWindow ? '✅ 存在' : '❌ 不存在');

  const transcriptBody = document.querySelector('.reader-video-transripts-body');
  console.log('  .reader-video-transripts-body:', transcriptBody ? '✅ 存在' : '❌ 不存在');

  const translationWrapper = document.querySelector('font.immersive-translate-target-wrapper');
  console.log('  沉浸式翻译元素:', translationWrapper ? '✅ 存在' : '❌ 不存在');

  if (!transcriptBody) {
    console.error('\n❌ 找不到字幕区域！请确保：');
    console.error('  1. 已打开 Packt 视频页面');
    console.error('  2. 视频已开始加载');
    console.error('  3. 右侧字幕区域已展开');
    return;
  }

  console.log('\n');

  // 2. 检查英文字幕
  console.log('2️⃣ 检查英文字幕:');
  const englishSpans = transcriptBody.querySelectorAll(':scope > span[data-start]');
  console.log(`  找到 ${englishSpans.length} 条英文字幕`);
  
  if (englishSpans.length > 0) {
    console.log('  前 3 条示例:');
    for (let i = 0; i < Math.min(3, englishSpans.length); i++) {
      const span = englishSpans[i];
      console.log(`    [${i}] data-start="${span.getAttribute('data-start')}" text="${span.textContent.trim().substring(0, 50)}..."`);
    }
  }

  console.log('\n');

  // 3. 检查中文翻译
  console.log('3️⃣ 检查中文翻译:');
  if (translationWrapper) {
    const translatedSpans = translationWrapper.querySelectorAll('span[data-start]');
    console.log(`  找到 ${translatedSpans.length} 条中文翻译`);
    
    if (translatedSpans.length > 0) {
      console.log('  前 3 条示例:');
      for (let i = 0; i < Math.min(3, translatedSpans.length); i++) {
        const span = translatedSpans[i];
        console.log(`    [${i}] data-start="${span.getAttribute('data-start')}" text="${span.textContent.trim().substring(0, 50)}..."`);
      }
    }
  } else {
    console.warn('  ⚠️ 未找到沉浸式翻译元素，请检查：');
    console.warn('    1. 沉浸式翻译插件是否已安装并启用');
    console.warn('    2. 沉浸式翻译是否已对当前页面生效');
    console.warn('    3. 刷新页面后再试');
  }

  console.log('\n');

  // 4. 测试字幕匹配
  console.log('4️⃣ 测试字幕匹配逻辑:');
  
  if (!captionText || !translationWrapper) {
    console.warn('  ⚠️ 跳过测试（缺少必要元素）');
    return;
  }

  const currentEnglishText = captionText.textContent.trim();
  console.log(`  当前视频字幕: "${currentEnglishText}"`);

  if (!currentEnglishText) {
    console.warn('  ⚠️ 当前没有字幕显示，请播放视频');
    return;
  }

  // 查找匹配的英文字幕
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
    console.warn(`  ⚠️ 未找到完全匹配的英文字幕`);
    console.log('  尝试部分匹配...');
    
    for (let i = 0; i < englishSpans.length; i++) {
      const englishText = englishSpans[i].textContent.trim();
      if (currentEnglishText.includes(englishText) || englishText.includes(currentEnglishText)) {
        matchedIndex = i;
        matchedDataStart = englishSpans[i].getAttribute('data-start');
        console.log(`  ✅ 找到部分匹配: 索引 ${i}`);
        break;
      }
    }
  } else {
    console.log(`  ✅ 找到完全匹配: 索引 ${matchedIndex}, data-start="${matchedDataStart}"`);
  }

  if (matchedIndex === -1) {
    console.error('  ❌ 无法匹配当前字幕，可能原因：');
    console.error('    1. 字幕文本格式不一致');
    console.error('    2. 字幕区域未展开');
    console.error('    3. 页面结构变化');
    return;
  }

  // 查找对应的中文翻译
  const translatedSpans = translationWrapper.querySelectorAll('span[data-start]');
  let translatedText = '';

  // 方法1: 通过 data-start 匹配
  if (matchedDataStart) {
    for (const span of translatedSpans) {
      if (span.getAttribute('data-start') === matchedDataStart) {
        translatedText = span.textContent.trim();
        console.log(`  ✅ 通过 data-start 找到翻译: "${translatedText}"`);
        break;
      }
    }
  }

  // 方法2: 通过索引匹配
  if (!translatedText && translatedSpans[matchedIndex]) {
    translatedText = translatedSpans[matchedIndex].textContent.trim();
    console.log(`  ✅ 通过索引找到翻译: "${translatedText}"`);
  }

  if (translatedText) {
    console.log('\n✅ 匹配成功！');
    console.log(`  英文: ${currentEnglishText}`);
    console.log(`  中文: ${translatedText}`);
  } else {
    console.error('\n❌ 未找到对应的中文翻译');
  }

  console.log('\n');

  // 5. 检查插件创建的元素
  console.log('5️⃣ 检查插件创建的元素:');
  const pluginElement = document.getElementById('packt-translated-subtitle');
  console.log('  #packt-translated-subtitle:', pluginElement ? '✅ 存在' : '❌ 不存在');
  if (pluginElement) {
    console.log('    当前内容:', pluginElement.textContent || '(空)');
    console.log('    显示状态:', pluginElement.style.display);
  }

  console.log('\n=== 调试完成 ===');
  console.log('提示: 如果发现问题，请截图 Console 输出并反馈');
})();
