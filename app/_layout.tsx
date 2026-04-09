import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from '../utils/database';

export default function RootLayout() {
  // 初始化数据库
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <Stack screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="index" options={{ title: 'GlowBuddy' }} />
      <Stack.Screen name="shop" options={{ title: '商店' }} />
      <Stack.Screen name="chat" options={{ title: 'AI 对话' }} />
    </Stack>
  );
}
