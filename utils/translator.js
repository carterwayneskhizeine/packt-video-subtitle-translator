// 翻译工具模块
const Translator = {
  // DeepSeek API 翻译
  async translateWithDeepSeek(text, apiKey) {
    if (!apiKey) {
      throw new Error('DeepSeek API Key 未配置');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的英译中翻译助手。请将用户提供的英文字幕翻译成简洁、准确、符合中文习惯的中文。只返回翻译结果，不要有任何解释或额外内容。'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek API 错误: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  },

  // OpenAI API 翻译
  async translateWithOpenAI(text, apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API Key 未配置');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的英译中翻译助手。请将用户提供的英文字幕翻译成简洁、准确、符合中文习惯的中文。只返回翻译结果，不要有任何解释或额外内容。'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API 错误: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  },

  // 百度翻译 API (简化版本，需要根据实际API调整)
  async translateWithBaidu(text, apiKey) {
    // 注意: 百度翻译API需要 APP ID 和 Secret Key
    // 这里提供的是示例结构，实际使用需要完善签名等逻辑
    throw new Error('百度翻译功能开发中，请使用 DeepSeek 或 OpenAI');
  },

  // 主翻译函数
  async translate(text, engine = 'deepseek', apiKey = '') {
    if (!text || !text.trim()) {
      return '';
    }

    // 移除多余空格
    text = text.trim();

    // 检查缓存
    const settings = await StorageManager.getSettings();
    if (settings.cacheEnabled) {
      const cached = await StorageManager.getCache(text);
      if (cached) {
        console.log('使用缓存翻译:', text, '->', cached.translation);
        return cached.translation;
      }
    }

    // 根据引擎选择翻译方法
    let translation;
    try {
      switch (engine) {
        case 'deepseek':
          translation = await this.translateWithDeepSeek(text, apiKey);
          break;
        case 'openai':
          translation = await this.translateWithOpenAI(text, apiKey);
          break;
        case 'baidu':
          translation = await this.translateWithBaidu(text, apiKey);
          break;
        default:
          throw new Error(`未知的翻译引擎: ${engine}`);
      }

      // 保存到缓存
      if (settings.cacheEnabled && translation) {
        await StorageManager.saveCache(text, translation);
      }

      console.log('翻译完成:', text, '->', translation);
      return translation;
    } catch (error) {
      console.error('翻译失败:', error);
      throw error;
    }
  }
};

// 如果在非模块环境中，使用全局变量
if (typeof window !== 'undefined') {
  window.Translator = Translator;
}
