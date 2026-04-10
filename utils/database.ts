import * as SQLite from 'expo-sqlite';

// 初始化数据库
const db = SQLite.openDatabase('glowbuddy.db');

// 初始化数据库表
export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      // 创建宠物状态表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS pet_status (
          id INTEGER PRIMARY KEY NOT NULL,
          mood TEXT NOT NULL,
          hunger INTEGER NOT NULL,
          coins INTEGER NOT NULL,
          last_fed TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => {
          console.log('pet_status table created or exists');
        },
        (tx, error) => {
          console.error('Error creating pet_status table:', error);
          return false;
        }
      );

      // 创建物品表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          price INTEGER NOT NULL,
          description TEXT,
          type TEXT NOT NULL
        );`,
        [],
        () => {
          console.log('items table created or exists');
        },
        (tx, error) => {
          console.error('Error creating items table:', error);
          return false;
        }
      );

      // 创建库存表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY NOT NULL,
          item_id TEXT NOT NULL,
          quantity INTEGER DEFAULT 1,
          acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (item_id) REFERENCES items(id)
        );`,
        [],
        () => {
          console.log('inventory table created or exists');
        },
        (tx, error) => {
          console.error('Error creating inventory table:', error);
          return false;
        }
      );

      // 创建购买历史表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS purchase_history (
          id INTEGER PRIMARY KEY NOT NULL,
          item_id TEXT NOT NULL,
          coins_spent INTEGER NOT NULL,
          purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (item_id) REFERENCES items(id)
        );`,
        [],
        () => {
          console.log('purchase_history table created or exists');
        },
        (tx, error) => {
          console.error('Error creating purchase_history table:', error);
          return false;
        }
      );

      // 创建对话历史表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS chat_history (
          id INTEGER PRIMARY KEY NOT NULL,
          message TEXT NOT NULL,
          sender TEXT NOT NULL, -- 'user' or 'ai'
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => {
          console.log('chat_history table created or exists');
        },
        (tx, error) => {
          console.error('Error creating chat_history table:', error);
          return false;
        }
      );

      // 插入默认宠物状态（如果不存在）
      tx.executeSql(
        `INSERT OR IGNORE INTO pet_status (id, mood, hunger, coins, last_fed) VALUES (1, 'neutral', 50, 10, NULL);`,
        [],
        () => {
          console.log('Default pet status inserted or exists');
        },
        (tx, error) => {
          console.error('Error inserting default pet status:', error);
          return false;
        }
      );

      // 插入默认物品
      const defaultItems = [
        { id: 'food1', name: '美味食物', price: 10, description: '增加20点饱食度', type: 'food' },
        { id: 'food2', name: '营养大餐', price: 20, description: '增加50点饱食度', type: 'food' },
        { id: 'toy1', name: '弹跳球', price: 15, description: '让宠物更开心', type: 'toy' },
        { id: 'deco1', name: '小帽子', price: 25, description: '可爱的装饰品', type: 'decoration' },
        { id: 'food3', name: '豪华套餐', price: 30, description: '增加满额饱食度', type: 'food' },
        { id: 'toy2', name: '发光玩具', price: 35, description: '最有趣的玩具', type: 'toy' }
      ];

      defaultItems.forEach(item => {
        tx.executeSql(
          `INSERT OR IGNORE INTO items (id, name, price, description, type) VALUES (?, ?, ?, ?, ?);`,
          [item.id, item.name, item.price, item.description, item.type],
          () => {
            console.log(`Item ${item.name} inserted or exists`);
          },
          (tx, error) => {
            console.error('Error inserting item:', error);
            return false;
          }
        );
      });
    }, 
    (error) => {
      console.error('Transaction error:', error);
      reject(error);
    }, 
    () => {
      console.log('Database initialization completed');
      resolve();
    });
  });
};

// 获取宠物状态
export const getPetStatus = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM pet_status WHERE id = 1;',
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows._array[0]);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error getting pet status:', error);
          reject(error);
        }
      );
    });
  });
};

// 更新宠物状态
export const updatePetStatus = (status: any) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE pet_status SET mood = ?, hunger = ?, coins = ?, last_fed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1;`,
        [status.mood, status.hunger, status.coins, status.lastFed],
        (_, result) => {
          console.log('Pet status updated successfully');
          resolve();
        },
        (_, error) => {
          console.error('Error updating pet status:', error);
          reject(error);
        }
      );
    });
  });
};

// 增加金币
export const addCoins = (amount: number) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE pet_status SET coins = coins + ? WHERE id = 1;`,
        [amount],
        (_, result) => {
          console.log(`Added ${amount} coins successfully`);
          resolve();
        },
        (_, error) => {
          console.error('Error adding coins:', error);
          reject(error);
        }
      );
    });
  });
};

// 扣除金币
export const subtractCoins = (amount: number) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE pet_status SET coins = coins - ? WHERE id = 1;`,
        [amount],
        (_, result) => {
          console.log(`Subtracted ${amount} coins successfully`);
          resolve();
        },
        (_, error) => {
          console.error('Error subtracting coins:', error);
          reject(error);
        }
      );
    });
  });
};

// 获取金币余额
export const getCoins = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT coins FROM pet_status WHERE id = 1;',
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows._array[0].coins);
          } else {
            resolve(0);
          }
        },
        (_, error) => {
          console.error('Error getting coins:', error);
          reject(error);
        }
      );
    });
  });
};

// 添加物品到库存
export const addItemToInventory = (itemId: string) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO inventory (item_id) VALUES (?);`,
        [itemId],
        (_, result) => {
          console.log(`Item ${itemId} added to inventory`);
          resolve();
        },
        (_, error) => {
          console.error('Error adding item to inventory:', error);
          reject(error);
        }
      );
    });
  });
};

// 获取库存
export const getInventory = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT i.*, inv.quantity 
         FROM inventory inv 
         JOIN items i ON inv.item_id = i.id;`,
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error('Error getting inventory:', error);
          reject(error);
        }
      );
    });
  });
};

// 记录购买历史
export const recordPurchase = (itemId: string, coinsSpent: number) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO purchase_history (item_id, coins_spent) VALUES (?, ?);`,
        [itemId, coinsSpent],
        (_, result) => {
          console.log(`Purchase recorded: ${itemId}, spent: ${coinsSpent}`);
          resolve();
        },
        (_, error) => {
          console.error('Error recording purchase:', error);
          reject(error);
        }
      );
    });
  });
};

// 获取购买历史
export const getPurchaseHistory = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT ph.*, i.name as item_name 
         FROM purchase_history ph 
         JOIN items i ON ph.item_id = i.id 
         ORDER BY ph.purchased_at DESC;`,
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error('Error getting purchase history:', error);
          reject(error);
        }
      );
    });
  });
};

// 添加聊天记录
export const addChatMessage = (message: string, sender: 'user' | 'ai') => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO chat_history (message, sender) VALUES (?, ?);`,
        [message, sender],
        (_, result) => {
          console.log(`Chat message added: ${sender}`);
          resolve();
        },
        (_, error) => {
          console.error('Error adding chat message:', error);
          reject(error);
        }
      );
    });
  });
};

// 获取聊天历史
export const getChatHistory = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM chat_history ORDER BY timestamp ASC;`,
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error('Error getting chat history:', error);
          reject(error);
        }
      );
    });
  });
};

// 检查今日是否已领取奖励
export const checkDailyRewardClaimed = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const today = new Date().toDateString();
    const lastRewardDate = localStorage.getItem('lastRewardDate');
    resolve(lastRewardDate === today);
  });
};

// 标记今日奖励已领取
export const markDailyRewardClaimed = () => {
  const today = new Date().toDateString();
  localStorage.setItem('lastRewardDate', today);
  console.log(`Daily reward marked as claimed for: ${today}`);
};

// 更新饱食度
export const updateHunger = (newHunger: number) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE pet_status SET hunger = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1;`,
        [newHunger],
        (_, result) => {
          console.log(`Hunger updated to: ${newHunger}`);
          resolve();
        },
        (_, error) => {
          console.error('Error updating hunger:', error);
          reject(error);
        }
      );
    });
  });
};

// 检查金币是否足够
export const hasEnoughCoins = async (amount: number): Promise<boolean> => {
  try {
    const coins = await getCoins();
    return coins >= amount;
  } catch (error) {
    console.error('Error checking coin balance:', error);
    return false;
  }
};
