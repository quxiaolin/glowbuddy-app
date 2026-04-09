import { Alert } from 'react-native';

// OpenAI API 配置
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// 模拟 AI 响应，实际项目中会调用真实的 OpenAI API
export const getAIResponse = async (message: string, context: any[] = []): Promise<string> => {
  // 在实际实现中，这里会调用 OpenAI API
  /*
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '你是一个可爱的电子宠物，正在与主人聊天。请保持友好、积极的语调，回应主人的关怀。'
          },
          ...context,
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // 返回错误消息，但不暴露敏感信息
    return "抱歉，暂时无法连接到AI助手，请稍后再试。";
  }
  */

  // 模拟响应逻辑 - 在实际项目中会被上面的真实 API 调用替代
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      const responses = [
        "很高兴你跟我聊天！你的电子宠物今天看起来很开心呢！",
        "哇，听起来很有趣！我也想听听更多关于你的故事。",
        "谢谢你的关心！我最喜欢和你聊天了。",
        "今天的天气怎么样？我们可以一起聊聊外面的世界。",
        "你知道吗？我每天都能学到新东西，多亏了有你陪伴。",
        "我感到很幸福，因为有你这样的朋友。",
        "我们可以一起玩个小游戏，你想试试吗？",
        "你今天过得怎么样？希望你像我一样开心！",
        "如果我是一个真实的小动物，我想我会很喜欢你的。",
        "和你聊天总是让我感到特别快乐！"
      ];
      
      // 根据用户输入生成更相关的回复
      if (message.toLowerCase().includes("你好") || message.toLowerCase().includes("hi")) {
        resolve("你好呀！我是你的 GlowBuddy，很高兴见到你！");
      } else if (message.toLowerCase().includes("宠物") || message.toLowerCase().includes("pet")) {
        resolve("你说的是我们的电子宠物吗？它今天的心情很不错哦！");
      } else if (message.toLowerCase().includes("开心") || message.toLowerCase().includes("快乐")) {
        resolve("看到你开心，我也很开心！我们一起让宠物保持愉快的心情吧！");
      } else if (message.toLowerCase().includes("喂") || message.toLowerCase().includes("food")) {
        resolve("如果你想喂宠物，可以去商店购买食物哦！");
      } else if (message.toLowerCase().includes("商店") || message.toLowerCase().includes("shop")) {
        resolve("商店里有很多有趣的物品，去看看有什么喜欢的吧！");
      } else {
        resolve(responses[Math.floor(Math.random() * responses.length)]);
      }
    }, 1000); // 模拟1秒的API调用延迟
  });
};

// 检查API密钥是否配置
export const isApiKeyConfigured = (): boolean => {
  return !!OPENAI_API_KEY;
};

// 测试API连接
export const testApiConnection = async (): Promise<boolean> => {
  try {
    // 在实际实现中，这里会发送一个简单的测试请求
    // 例如：调用models端点来验证API密钥
    return true; // 模拟成功
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};
