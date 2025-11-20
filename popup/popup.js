// Popup 页面逻辑

document.addEventListener('DOMContentLoaded', async () => {
  // 获取元素
  const enableToggle = document.getElementById('enableToggle');
  const statusDiv = document.getElementById('status');
  const githubLink = document.getElementById('githubLink');
  const offsetSlider = document.getElementById('offsetSlider');
  const offsetValue = document.getElementById('offsetValue');
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeValue = document.getElementById('fontSizeValue');

  // 加载设置
  const settings = await loadSettings();

  // 填充表单
  enableToggle.checked = settings.enabled;
  offsetSlider.value = settings.subtitleOffset;
  offsetValue.textContent = offsetSlider.value;
  fontSizeSlider.value = settings.subtitleFontSize;
  fontSizeValue.textContent = fontSizeSlider.value;

  // 开关状态变化时直接保存
  // 更新滑块值显示
  const updateSliderValue = (slider, valueEl) => {
    valueEl.textContent = slider.value;
  };

  offsetSlider.addEventListener('input', () => updateSliderValue(offsetSlider, offsetValue));
  fontSizeSlider.addEventListener('input', () => updateSliderValue(fontSizeSlider, fontSizeValue));

  // 保存设置
  const saveSettings = async () => {
    const newSettings = {
      enabled: enableToggle.checked,
      subtitleOffset: parseInt(offsetSlider.value),
      subtitleFontSize: parseInt(fontSizeSlider.value)
    };

    try {
      await chrome.storage.sync.set({ settings: newSettings });
      showStatus('✅ 已保存！', 'success');
    } catch (error) {
      showStatus('❌ 保存失败：' + error.message, 'error');
    }
  };

  enableToggle.addEventListener('change', saveSettings);
  offsetSlider.addEventListener('change', saveSettings);
  fontSizeSlider.addEventListener('change', saveSettings);

  // GitHub链接点击事件
  githubLink.addEventListener('click', (e) => {
    // 可以在这里添加分析代码或其他逻辑
    // 目前直接跳转，已经在HTML中设置了target="_blank"
  });
});

// 加载设置
async function loadSettings() {
  const defaultSettings = {
    enabled: true,
    subtitleOffset: 0,
    subtitleFontSize: 16
  };

  const result = await chrome.storage.sync.get('settings');
  return { ...defaultSettings, ...result.settings };
}

// 显示状态消息
function showStatus(message, type = 'success') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;

  // 2秒后自动隐藏
  setTimeout(() => {
    statusDiv.className = 'status hidden';
  }, 2000);
}
