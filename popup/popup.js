// Popup 页面逻辑

document.addEventListener('DOMContentLoaded', async () => {
  // 获取元素
  const enableToggle = document.getElementById('enableToggle');
  const statusDiv = document.getElementById('status');
  const githubLink = document.getElementById('githubLink');

  // 加载设置
  const settings = await loadSettings();

  // 填充表单
  enableToggle.checked = settings.enabled;

  // 开关状态变化时直接保存
  enableToggle.addEventListener('change', async () => {
    const newSettings = {
      enabled: enableToggle.checked
    };

    try {
      await chrome.storage.sync.set({ settings: newSettings });
      showStatus('✅ Saved!', 'success');
    } catch (error) {
      showStatus('❌ Save failed: ' + error.message, 'error');
    }
  });

  // GitHub链接点击事件
  githubLink.addEventListener('click', (e) => {
    // 可以在这里添加分析代码或其他逻辑
    // 目前直接跳转，已经在HTML中设置了target="_blank"
  });
});

// 加载设置
async function loadSettings() {
  const defaultSettings = {
    enabled: true
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
