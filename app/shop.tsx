import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Alert, StatusBar, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCoins, subtractCoins, hasEnoughCoins, addItemToInventory, getInventory, recordPurchase } from '../utils/database';

// 商品类型定义
type Item = {
  id: string;
  name: string;
  price: number;
  description: string;
  type: 'food' | 'toy' | 'decoration';
};

// 购买记录类型
type PurchaseRecord = {
  itemId: string;
  timestamp: Date;
};

export default function ShopScreen() {
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // 商品列表
  const items: Item[] = [
    {
      id: 'food1',
      name: '美味食物',
      price: 10,
      description: '增加20点饱食度',
      type: 'food'
    },
    {
      id: 'food2',
      name: '营养大餐',
      price: 20,
      description: '增加50点饱食度',
      type: 'food'
    },
    {
      id: 'toy1',
      name: '弹跳球',
      price: 15,
      description: '让宠物更开心',
      type: 'toy'
    },
    {
      id: 'deco1',
      name: '小帽子',
      price: 25,
      description: '可爱的装饰品',
      type: 'decoration'
    },
    {
      id: 'food3',
      name: '豪华套餐',
      price: 30,
      description: '增加满额饱食度',
      type: 'food'
    },
    {
      id: 'toy2',
      name: '发光玩具',
      price: 35,
      description: '最有趣的玩具',
      type: 'toy'
    }
  ];

  // 加载初始数据
  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      // 获取当前金币
      const currentCoins = await getCoins();
      setCoins(currentCoins);
      
      // 获取库存
      const currentInventory = await getInventory();
      setInventory(currentInventory.map(item => item.id));
    } catch (error) {
      console.error('Error loading shop data:', error);
      Alert.alert('错误', '加载商店数据失败');
    }
  };

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    await loadShopData();
    setRefreshing(false);
  };

  // 购买商品
  const purchaseItem = async (item: Item) => {
    try {
      if (coins < item.price) {
        Alert.alert('金币不足', `您需要 ${item.price} 金币，但只有 ${coins} 金币`);
        return;
      }

      // 检查是否有足够金币
      const canAfford = await hasEnoughCoins(item.price);
      if (!canAfford) {
        Alert.alert('金币不足', `您的金币不足以购买 ${item.name}`);
        return;
      }

      // 扣除金币
      await subtractCoins(item.price);
      const newCoins = coins - item.price;
      setCoins(newCoins);

      // 添加到库存
      await addItemToInventory(item.id);
      setInventory([...inventory, item.id]);

      // 记录购买历史
      const newRecord: PurchaseRecord = {
        itemId: item.id,
        timestamp: new Date()
      };
      setPurchaseHistory([...purchaseHistory, newRecord]);

      // 记录购买
      await recordPurchase(item.id, item.price);

      Alert.alert('购买成功', `您购买了 ${item.name}！`);
    } catch (error) {
      console.error('Error purchasing item:', error);
      Alert.alert('购买失败', '购买过程中出现错误，请重试');
    }
  };

  // 渲染商品项
  const renderItem = ({ item }: { item: Item }) => {
    const owned = inventory.includes(item.id);
    const canAfford = coins >= item.price;
    
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{item.price} <Ionicons name="cash-outline" size={14} /></Text>
        </View>
        
        <Text style={styles.itemDescription}>{item.description}</Text>
        
        <View style={styles.itemFooter}>
          <Text style={styles.itemType}>
            类型: {item.type === 'food' ? '食物' : item.type === 'toy' ? '玩具' : '装饰'}
          </Text>
          
          {owned ? (
            <Text style={styles.ownedTag}>已拥有</Text>
          ) : (
            <TouchableOpacity
              style={[
                styles.buyButton,
                !canAfford && styles.disabledButton
              ]}
              onPress={() => purchaseItem(item)}
              disabled={!canAfford}
            >
              <Text style={styles.buyButtonText}>购买</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.coinsContainer}>
          <Ionicons name="cash-outline" size={24} color="#FFD700" />
          <Text style={styles.coinsText}>{coins}</Text>
        </View>
      </View>
      
      <Text style={styles.title}>商店</Text>
      <Text style={styles.subtitle}>用金币购买物品来照顾你的宠物</Text>
      
      {/* 商品列表 */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemType: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  ownedTag: {
    backgroundColor: '#4CAF50',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
