import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { View, StyleSheet } from 'react-native';

type PetAnimationProps = {
  mood: 'happy' | 'neutral' | 'sad';
  size?: number;
  isInteracting?: boolean;
};

const PetAnimation: React.FC<PetAnimationProps> = ({ 
  mood, 
  size = 200, 
  isInteracting = false 
}) => {
  const animationRef = useRef<LottieView>(null);

  // 根据心情选择不同的动画
  const getAnimationSource = () => {
    // 这里我们会根据心情返回不同的 Lottie 动画资源
    // 为了演示目的，我们使用一个通用的呼吸动画
    // 实际项目中，这里应该有多个不同的动画文件
    
    // 模拟不同心情的动画
    if (mood === 'happy') {
      // 快乐时的动画 - 更活泼
      return require('../assets/animations/pet_happy.json'); // 我们将创建这个文件
    } else if (mood === 'sad') {
      // 难过时的动画 - 较慢或下沉
      return require('../assets/animations/pet_sad.json'); // 我们将创建这个文件
    } else {
      // 一般/中性时的动画 - 标准呼吸
      return require('../assets/animations/pet_neutral.json'); // 我们将创建这个文件
    }
  };

  // 当心情改变时，播放相应的动画
  useEffect(() => {
    if (animationRef.current) {
      // 重新播放动画
      animationRef.current.play();
    }
  }, [mood]);

  // 当交互发生时，播放特殊动画
  useEffect(() => {
    if (isInteracting && animationRef.current) {
      // 播放交互动画，比如弹跳
      animationRef.current.play(0, 30); // 播放前30帧作为交互反馈
    }
  }, [isInteracting]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        ref={animationRef}
        source={getAnimationSource()}
        style={styles.animation}
        autoPlay
        loop
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default PetAnimation;
