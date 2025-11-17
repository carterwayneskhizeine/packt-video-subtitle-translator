// Popup 页面逻辑

document.addEventListener('DOMContentLoaded', async () => {
  // 获取元素
  const enableToggle = document.getElementById('enableToggle');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // 加载设置
  const settings = await loadSettings();

  // 填充表单
  enableToggle.checked = settings.enabled;

  // 保存设置
  saveBtn.addEventListener('click', async () => {
    const newSettings = {
      enabled: enableToggle.checked
    };

    try {
      await chrome.storage.sync.set({ settings: newSettings });
      showStatus('✅ 设置已保存！', 'success');
    } catch (error) {
      showStatus('❌ 保存失败: ' + error.message, 'error');
    }
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

  // 3秒后自动隐藏
  setTimeout(() => {
    statusDiv.className = 'status hidden';
  }, 3000);
}
