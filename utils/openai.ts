import { Alert } from 'react-native';
import { addCoins } from './database';

// OpenAI API 配置
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// 检查API密钥是否配置
export const isApiKeyConfigured = (): boolean => {
  return !!OPENAI_API_KEY;
};

// 调用 OpenAI API 获取响应
export const getAIResponse = async (message: string, context: any[] = []): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // 验证API密钥格式（简单检查）
    if (!OPENAI_API_KEY.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }

    const response = await fetch(\`\${OPENAI_BASE_URL}/chat/completions\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${OPENAI_API_KEY}\`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '你是一个可爱、友善的电子宠物，名叫GlowBuddy。你正在与主人聊天，表现出温暖、积极的态度，回应主人的关怀。请保持简洁友好的回复，避免过于复杂的语言。'
          },
          ...context,
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(\`API request failed with status \${response.status}: \${errorData.error?.message || 'Unknown error'}\`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error);
    
    // 根据错误类型返回不同的消息
    if (error.message.includes('API key')) {
      return "抱歉，AI助手配置有问题，请检查API密钥设置。";
    } else if (error.message.includes('429')) {
      return "抱歉，AI助手暂时繁忙，请稍后再试。";
    } else if (error.message.includes('401')) {
      return "抱歉，无法连接到AI助手，请检查配置。";
    } else {
      // 返回一个友好的默认消息，不暴露内部错误
      return "抱歉，暂时无法连接到AI助手，请稍后再试。";
    }
  }
};

// 检查今日对话次数是否达到限制
export const hasReachedDailyLimit = (): boolean => {
  const today = new Date().toDateString();
  const storedData = localStorage.getItem(\`chatCount_\${today}\`);
  
  if (storedData) {
    const { count } = JSON.parse(storedData);
    return count >= 30;
  }
  
  return false;
};

// 增加对话计数
export const incrementChatCount = (): number => {
  const today = new Date().toDateString();
  const storedData = localStorage.getItem(\`chatCount_\${today}\`);
  
  let count = 0;
  if (storedData) {
    const data = JSON.parse(storedData);
    count = data.count;
  }
  
  count = Math.min(count + 1, 30); // 确保不超过30
  
  localStorage.setItem(\`chatCount_\${today}\`, JSON.stringify({ count, timestamp: new Date().toISOString() }));
  
  return count;
};

// 获取今日剩余对话次数
export const getRemainingChats = (): number => {
  const today = new Date().toDateString();
  const storedData = localStorage.getItem(\`chatCount_\${today}\`);
  
  if (storedData) {
    const { count } = JSON.parse(storedData);
    return Math.max(0, 30 - count);
  }
  
  return 30;
};

// 重置每日对话计数（在新的一天）
export const resetDailyChatCountIfNeeded = () => {
  const today = new Date().toDateString();
  const lastChecked = localStorage.getItem('lastChatCheckDate');
  
  if (lastChecked !== today) {
    // 新的一天，重置计数
    localStorage.setItem(\`chatCount_\${today}\`, JSON.stringify({ count: 0, timestamp: new Date().toISOString() }));
    localStorage.setItem('lastChatCheckDate', today);
  }
};

// 提供对话奖励
export const awardChatBonus = async () => {
  try {
    // 给予2金币奖励
    await addCoins(2);
    return true;
  } catch (error) {
    console.error('Error awarding chat bonus:', error);
    return false;
  }
};

// 测试API连接
export const testApiConnection = async (): Promise<boolean> => {
  try {
    if (!OPENAI_API_KEY) {
      return false;
    }

    // 发送一个简单的测试请求
    const response = await fetch(\`\${OPENAI_BASE_URL}/models\`, {
      headers: {
        'Authorization': \`Bearer \${OPENAI_API_KEY}\`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};
