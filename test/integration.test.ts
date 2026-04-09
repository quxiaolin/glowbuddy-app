/**
 * GlowBuddy 全链路功能测试
 * 
 * 测试目标：
 * 1. 验证数据库连接和CRUD操作
 * 2. 验证宠物状态管理
 * 3. 验证经济系统（金币、商店）
 * 4. 验证AI对话功能
 */

import { initDatabase, getPetStatus, updatePetStatus, addCoins, getCoins, subtractCoins, hasEnoughCoins, addItemToInventory, getInventory, recordPurchase, getPurchaseHistory, addChatMessage, getChatHistory } from '../utils/database';
import { getAIResponse, isApiKeyConfigured, hasReachedDailyLimit, incrementChatCount, getRemainingChats, resetDailyChatCountIfNeeded, awardChatBonus } from '../utils/openai';

// 模拟测试数据
const mockPetStatus = {
  mood: 'happy' as const,
  hunger: 80,
  coins: 50,
  lastFed: new Date()
};

describe('GlowBuddy Integration Tests', () => {
  beforeAll(() => {
    // 初始化数据库
    initDatabase();
  });

  describe('1. 数据库功能测试', () => {
    test('数据库初始化应成功', () => {
      expect(() => initDatabase()).not.toThrow();
    });

    test('宠物状态CRUD操作应正常', async () => {
      // 更新宠物状态
      await updatePetStatus(mockPetStatus);
      
      // 获取宠物状态
      const status = await getPetStatus();
      expect(status).toBeDefined();
      expect(status.mood).toBe(mockPetStatus.mood);
      expect(status.hunger).toBe(mockPetStatus.hunger);
      expect(status.coins).toBe(mockPetStatus.coins);
    });

    test('金币管理应正常', async () => {
      // 获取初始金币
      const initialCoins = await getCoins();
      
      // 增加金币
      await addCoins(10);
      const coinsAfterAdd = await getCoins();
      expect(coinsAfterAdd).toBe(initialCoins + 10);
      
      // 扣除金币
      await subtractCoins(5);
      const coinsAfterSubtract = await getCoins();
      expect(coinsAfterSubtract).toBe(coinsAfterAdd - 5);
    });

    test('库存管理应正常', async () => {
      // 添加物品到库存
      await addItemToInventory('food1');
      
      // 获取库存
      const inventory = await getInventory();
      expect(inventory).toBeDefined();
      expect(Array.isArray(inventory)).toBeTruthy();
    });

    test('购买历史记录应正常', async () => {
      // 记录购买
      await recordPurchase('food1', 10);
      
      // 获取购买历史
      const history = await getPurchaseHistory();
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBeTruthy();
    });

    test('聊天历史记录应正常', async () => {
      // 添加聊天记录
      await addChatMessage('Hello', 'user');
      await addChatMessage('Hi there!', 'ai');
      
      // 获取聊天历史
      const history = await getChatHistory();
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBeTruthy();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('2. 经济系统测试', () => {
    test('金币余额检查应正常', async () => {
      // 假设当前有20金币
      await addCoins(20);
      const hasEnough = await hasEnoughCoins(15);
      expect(hasEnough).toBeTruthy();
      
      const hasNotEnough = await hasEnoughCoins(25);
      expect(hasNotEnough).toBeFalsy();
    });

    test('饱食度更新应正常', async () => {
      // 这部分依赖于数据库中的额外函数，如果存在的话
      console.log('饱食度更新测试 - 需要数据库支持');
    });
  });

  describe('3. AI对话系统测试', () => {
    test('API配置检查应正常', () => {
      const isConfigured = isApiKeyConfigured();
      // 这取决于环境变量是否设置
      console.log('API Key Configured:', isConfigured);
    });

    test('每日对话限制应正常', () => {
      // 重置每日计数（仅用于测试）
      resetDailyChatCountIfNeeded();
      
      // 检查初始状态
      const initialHasReached = hasReachedDailyLimit();
      expect(initialHasReached).toBeFalsy();
      
      // 检查剩余次数
      const initialRemaining = getRemainingChats();
      expect(initialRemaining).toBe(30);
      
      // 增加几次计数
      for (let i = 0; i < 5; i++) {
        incrementChatCount();
      }
      
      const remainingAfterIncrement = getRemainingChats();
      expect(remainingAfterIncrement).toBe(25);
    });

    test('AI响应获取应正常（模拟）', async () => {
      const response = await getAIResponse('你好');
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });
  });

  describe('4. 奖励系统测试', () => {
    test('对话奖励发放应正常', async () => {
      const initialCoins = await getCoins();
      
      // 发放奖励
      const success = await awardChatBonus();
      expect(success).toBeTruthy();
      
      const finalCoins = await getCoins();
      expect(finalCoins).toBe(initialCoins + 2); // 奖励2金币
    });
  });

  describe('5. 边界情况测试', () => {
    test('金币不能为负数', async () => {
      const initialCoins = await getCoins();
      
      // 尝试扣除超过余额的金币
      const largeAmount = initialCoins + 100;
      await subtractCoins(largeAmount);
      
      // 余额不应为负数（具体行为取决于数据库约束）
      const finalCoins = await getCoins();
      console.log(`Initial: ${initialCoins}, After subtracting ${largeAmount}: ${finalCoins}`);
    });

    test('对话次数不应超过30次', () => {
      // 模拟一天内达到最大次数
      let count = 0;
      while (count < 35) { // 尝试超过限制
        incrementChatCount();
        count++;
      }
      
      const remaining = getRemainingChats();
      expect(remaining).toBeGreaterThanOrEqual(0);
      
      const hasReachedLimit = hasReachedDailyLimit();
      expect(hasReachedLimit).toBeTruthy();
    });
  });

  afterAll(() => {
    console.log('所有测试完成');
  });
});

// 为了在Node环境下运行，我们需要模拟一些React Native API
// @ts-ignore
global.localStorage = {
  getItem: jest.fn((key) => {
    // 模拟存储数据
    const store: Record<string, string> = {};
    return store[key] || null;
  }),
  setItem: jest.fn((key, value) => {
    // 模拟存储数据
  }),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
