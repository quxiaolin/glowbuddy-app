import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert, Dimensions, Linking } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { initDatabase, getPetStatus, updatePetStatus, addCoins, getCoins, updateHunger, hasEnoughCoins } from '../utils/database';
import { safeCoinOperation, safeHungerOperation, limitChecker, handleAppError, ErrorType, AppError } from '../utils/errorHandler';

// 宠物状态类型
type PetStatus = {
  mood: 'happy' | 'neutral' | 'sad'; // 心情状态
  hunger: number; // 饥饿值 (0-100)
  coins: number; // 金币数量
  lastFed: Date | null; // 上次喂食时间
};

// 模拟 Lottie 组件（因为我们还没有创建实际的动画文件）
const PetAnimation = ({ mood, size = 150, isInteracting = false }: { mood: string, size?: number, isInteracting?: boolean }) => {
  const getColorFromMood = () => {
    switch (mood) {
      case 'happy': return '#FFD700'; // 金色
      case 'neutral': return '#FFA500'; // 橙色
      case 'sad': return '#1E90FF'; // 蓝色
      default: return '#FFA500';
    }
  };

  return (
    <View style={[styles.petBody, { 
      width: size, 
      height: size, 
      backgroundColor: getColorFromMood(),
      opacity: 0.7
    }]} />
  );
};

export default function HomeScreen() {
  const [petStatus, setPetStatus] = useState<PetStatus>({
    mood: 'neutral',
    hunger: 50,
    coins: 10,
    lastFed: null
  });
  
  const [loading, setLoading] = useState(true);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  // 加载初始数据
  useEffect(() => {
    loadInitialData();
    checkDailyReward();
  }, []);

  // 加载初始数据
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await initDatabase(); // 确保数据库初始化
      
      const status = await getPetStatus();
      if (status) {
        setPetStatus({
          mood: status.mood,
          hunger: status.hunger,
          coins: status.coins,
          lastFed: status.last_fed ? new Date(status.last_fed) : null
        });
      }
    } catch (error) {
      console.error('Error loading pet status:', error);
      handleAppError(error, 'HomeScreen.loadInitialData');
      
      // 使用默认值
      setPetStatus({
        mood: 'neutral',
        hunger: 50,
        coins: 10,
        lastFed: null
      });
    } finally {
      setLoading(false);
    }
  };

  // 检查每日奖励
  const checkDailyReward = async () => {
    try {
      const today = new Date().toDateString();
      const lastRewardDate = localStorage.getItem('lastRewardDate');
      
      if (lastRewardDate !== today) {
        // 发放每日奖励
        await addCoins(10);
        setPetStatus(prev => ({
          ...prev,
          coins: safeCoinOperation.add(prev.coins, 10)
        }));
        localStorage.setItem('lastRewardDate', today);
        Alert.alert('每日奖励', '获得10枚金币！');
      }
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      handleAppError(error, 'HomeScreen.checkDailyReward');
    }
  };

  // 单击宠物触发弹跳动画和震动
  const handlePress = async () => {
    try {
      // 触发震动反馈
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // 弹跳动画
      scale.value = withSpring(1.2, {}, (finished) => {
        if (finished) {
          scale.value = withSpring(1);
        }
      });
      
      // 旋转动画
      rotation.value = withRepeat(withSpring(5, {}, (finished) => {
        if (finished) {
          rotation.value = withSpring(0);
        }
      }), 1);
      
      // 增加金币
      await addCoins(1);
      setPetStatus(prev => ({
        ...prev,
        coins: safeCoinOperation.add(prev.coins, 1)
      }));
    } catch (error) {
      console.error('Error handling press:', error);
      handleAppError(error, 'HomeScreen.handlePress');
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  // 长按喂食
  const handleLongPress = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // 检查是否有足够的饱食度减少空间
      if (petStatus.hunger <= 0) {
        Alert.alert('提示', '宠物已经很饱了，不能再喂食了！');
        return;
      }
      
      setPetStatus(prev => {
        try {
          // 减少饥饿值（增加饱食度）
          const newHunger = safeHungerOperation.update(prev.hunger, -20);
          const newMood = newHunger <= 30 ? 'happy' : newHunger <= 70 ? 'neutral' : 'sad';
          
          // 更新数据库
          updatePetStatus({
            mood: newMood,
            hunger: newHunger,
            coins: prev.coins,
            lastFed: new Date()
          });
          
          return {
            ...prev,
            hunger: newHunger,
            mood: newMood,
            lastFed: new Date()
          };
        } catch (error) {
          console.error('Error updating pet status:', error);
          handleAppError(error, 'HomeScreen.handleLongPress');
          return prev; // 返回原始状态
        }
      });
      
      // 动画反馈
      opacity.value = withRepeat(withTiming(0.7, { duration: 200 }, (finished) => {
        if (finished) {
          opacity.value = withTiming(1, { duration: 200 });
        }
      }), 1);
    } catch (error) {
      console.error('Error handling long press:', error);
      handleAppError(error, 'HomeScreen.handleLongPress');
      Alert.alert('错误', '喂食失败，请重试');
    }
  };

  // 获取心情对应的颜色
  const getMoodColor = () => {
    switch (petStatus.mood) {
      case 'happy': return '#FFD700'; // 金色
      case 'neutral': return '#FFA500'; // 橙色
      case 'sad': return '#1E90FF'; // 蓝色
      default: return '#FFA500';
    }
  };

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
      opacity: opacity.value
    };
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: getMoodColor() }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在加载宠物...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getMoodColor() }]}>
      <StatusBar barStyle="light-content" />
      
      {/* 头部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/chat')}>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="white" />
        </TouchableOpacity>
        
        <View style={styles.coinsContainer}>
          <Ionicons name="cash-outline" size={24} color="white" />
          <Text style={styles.coinsText}>{petStatus.coins}</Text>
        </View>
        
        <TouchableOpacity onPress={() => router.push('/shop')}>
          <Ionicons name="cart-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* 宠物区域 */}
      <View style={styles.petArea}>
        <TouchableOpacity
          style={styles.petContainer}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
        >
          <Animated.View style={[styles.pet, animatedStyle]}>
            <PetAnimation 
              mood={petStatus.mood} 
              size={150} 
              isInteracting={scale.value > 1} 
            />
          </Animated.View>
          
          {/* 心情指示器 */}
          <View style={styles.moodIndicator}>
            <Text style={styles.moodText}>
              {petStatus.mood === 'happy' ? '开心' : petStatus.mood === 'neutral' ? '一般' : '难过'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* 饱食度条 */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>饱食度</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${100 - petStatus.hunger}%`,
                backgroundColor: petStatus.hunger > 70 ? '#FF6B6B' : petStatus.hunger > 30 ? '#4ECDC4' : '#45B7D1'
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{Math.round(100 - petStatus.hunger)}%</Text>
      </View>
      
      {/* 操作提示 */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>点击宠物 +1金币 | 长按喂食</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  petArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petContainer: {
    alignItems: 'center',
  },
  pet: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  petBody: {
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodIndicator: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  moodText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    width: 60,
  },
  progressBar: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  instructions: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
});
