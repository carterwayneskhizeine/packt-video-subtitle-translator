// 存储管理模块 - 简化版（仅保留基础设置）
const StorageManager = {
  // 获取设置
  async getSettings() {
    const defaultSettings = {
      enabled: true
    };

    const result = await chrome.storage.sync.get('settings');
    return { ...defaultSettings, ...result.settings };
  },

  // 保存设置
  async saveSettings(settings) {
    await chrome.storage.sync.set({ settings });
  }
};

// 如果在非模块环境中，使用全局变量
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
