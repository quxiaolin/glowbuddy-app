import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from '../utils/database';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await initDatabase();
        setDbInitialized(true);
        
        // Simulate loading other resources
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        
        setAppReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setAppReady(true); // Still proceed to show the app even if there are errors
      } finally {
        // Hide the splash screen after initialization
        if (appReady) {
          SplashScreen.hideAsync();
        }
      }
    };

    initializeApp();
  }, []);

  if (!appReady || !dbInitialized) {
    // You can return a loading component here if needed
    return null;
  }

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
