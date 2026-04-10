// 错误处理和边界情况处理模块

// 错误类型定义
export enum ErrorType {
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  API_ERROR = 'API_ERROR'
}

// 自定义错误类
export class AppError extends Error {
  type: ErrorType;
  details?: any;

  constructor(type: ErrorType, message: string, details?: any) {
    super(message);
    this.type = type;
    this.details = details;
    this.name = 'AppError';
  }
}

// 边界值验证函数
export const validateInputs = {
  // 验证金币数量
  coins: (amount: number): boolean => {
    return Number.isInteger(amount) && amount >= 0 && amount <= 999999;
  },

  // 验证饱食度值
  hunger: (value: number): boolean => {
    return Number.isInteger(value) && value >= 0 && value <= 100;
  },

  // 验证消息长度
  message: (message: string, maxLength: number = 200): boolean => {
    return typeof message === 'string' && message.length > 0 && message.length <= maxLength;
  },

  // 验证用户名
  username: (username: string): boolean => {
    return typeof username === 'string' && username.length >= 2 && username.length <= 20;
  }
};

// 金币安全操作
export const safeCoinOperation = {
  // 安全增加金币
  add: (current: number, amount: number): number => {
    if (!validateInputs.coins(amount)) {
      throw new AppError(ErrorType.VALIDATION_ERROR, '无效的金币增加数量');
    }

    const newAmount = current + amount;
    // 设置最大金币限制
    return Math.min(newAmount, 999999);
  },

  // 安全扣除金币
  subtract: (current: number, amount: number): number => {
    if (!validateInputs.coins(amount)) {
      throw new AppError(ErrorType.VALIDATION_ERROR, '无效的金币扣除数量');
    }

    if (current < amount) {
      throw new AppError(ErrorType.INSUFFICIENT_FUNDS, '金币余额不足');
    }

    return Math.max(current - amount, 0);
  }
};

// 饱食度安全操作
export const safeHungerOperation = {
  // 安全更新饱食度
  update: (current: number, change: number): number => {
    if (!validateInputs.hunger(current) || !Number.isInteger(change)) {
      throw new AppError(ErrorType.VALIDATION_ERROR, '无效的饱食度值');
    }

    const newValue = current + change;
    return Math.min(Math.max(newValue, 0), 100); // 限制在0-100之间
  }
};

// 限制检查
export const limitChecker = {
  // 检查对话次数限制
  checkChatLimit: (used: number, max: number = 30): boolean => {
    return used < max;
  },

  // 检查库存数量限制
  checkInventoryLimit: (count: number, max: number = 100): boolean => {
    return count < max;
  },

  // 检查消息长度限制
  checkMessageLength: (message: string, maxLength: number = 200): boolean => {
    return message.length <= maxLength;
  }
};

// 通用错误处理器
export const handleAppError = (error: any, context: string = 'Application'): void => {
  console.error(`[${context}] Error occurred:`, error);

  // 根据错误类型采取不同措施
  if (error instanceof AppError) {
    switch (error.type) {
      case ErrorType.DATABASE_ERROR:
        console.error('Database operation failed, check connection and schema');
        break;
      case ErrorType.NETWORK_ERROR:
        console.error('Network request failed, check connectivity');
        break;
      case ErrorType.LIMIT_EXCEEDED:
        console.error('Usage limit exceeded');
        break;
      case ErrorType.API_ERROR:
        console.error('External API service error');
        break;
      default:
        console.error('General application error');
    }
  } else {
    console.error('Unexpected error:', error);
  }
};

// 重试机制
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed, attempt ${i + 1}/${maxRetries}`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// 数据清理和恢复
export const dataSanitizer = {
  // 清理用户数据
  sanitizeUserData: (userData: any): any => {
    return {
      ...userData,
      // 确保数值在有效范围内
      coins: Math.max(0, Math.min(userData.coins || 0, 999999)),
      hunger: Math.max(0, Math.min(userData.hunger || 50, 100)),
      // 清理可能的恶意字符串
      name: String(userData.name || '').substring(0, 50),
    };
  },

  // 验证和修复损坏的数据
  validateAndRepair: (data: any): any => {
    const repairedData = { ...data };

    // 修复可能损坏的数值
    if (typeof repairedData.coins !== 'number' || repairedData.coins < 0) {
      repairedData.coins = 0;
    }
    if (typeof repairedData.hunger !== 'number' || repairedData.hunger < 0) {
      repairedData.hunger = 50; // 默认值
    }

    return repairedData;
  }
};

// 安全的本地存储操作
export const safeLocalStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      handleAppError(error, 'LocalStorage');
    }
  },

  getItem: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      handleAppError(error, 'LocalStorage');
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      handleAppError(error, 'LocalStorage');
    }
  }
};
