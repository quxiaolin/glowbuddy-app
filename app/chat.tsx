import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { addChatMessage, getChatHistory } from '../utils/database';
import { 
  getAIResponse, 
  hasReachedDailyLimit, 
  incrementChatCount, 
  getRemainingChats, 
  resetDailyChatCountIfNeeded,
  awardChatBonus,
  isApiKeyConfigured
} from '../utils/openai';

// 消息类型
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [remainingChats, setRemainingChats] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 检查 API 配置和初始化
  useEffect(() => {
    checkApiConfiguration();
    loadChatHistory();
    resetDailyChatCountIfNeeded(); // 检查是否需要重置每日计数
    updateChatCount(); // 更新剩余对话次数
  }, []);

  // 滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // 检查 API 配置
  const checkApiConfiguration = async () => {
    const configured = isApiKeyConfigured();
    setApiConfigured(configured);
    
    if (!configured) {
      Alert.alert(
        'API 配置提醒', 
        'OpenAI API 密钥未配置，将使用模拟响应。请在 .env 文件中设置 EXPO_PUBLIC_OPENAI_API_KEY',
        [{ text: '确定' }]
      );
    }
  };

  // 更新剩余对话次数
  const updateChatCount = () => {
    const remaining = getRemainingChats();
    setRemainingChats(remaining);
  };

  const loadChatHistory = async () => {
    try {
      // 从数据库加载历史消息
      const history = await getChatHistory();
      const formattedMessages = history.map((msg: any) => ({
        id: msg.id.toString(),
        text: msg.message,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      Alert.alert('错误', '加载聊天历史失败');
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    if (hasReachedDailyLimit()) {
      Alert.alert('今日对话次数已达上限', '每天最多可以和宠物对话30次，明天再来吧！');
      return;
    }

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 保存用户消息到数据库
      await addChatMessage(inputText, 'user');

      // 增加对话计数
      const newCount = incrementChatCount();
      const newRemaining = 30 - newCount;
      setRemainingChats(newRemaining);

      // 获取 AI 回复
      const aiResponse = await getAIResponse(inputText);
      
      // 添加 AI 消息
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // 保存 AI 消息到数据库
      await addChatMessage(aiResponse, 'ai');
      
      // 给予对话奖励
      const bonusAwarded = await awardChatBonus();
      if (bonusAwarded) {
        Alert.alert('奖励', '获得2枚金币！');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: '抱歉，暂时无法连接到AI助手，请稍后再试。',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        { backgroundColor: item.sender === 'user' ? '#4CAF50' : '#2196F3' }
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.chatInfo}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#333" />
          <Text style={styles.chatTitle}>AI 对话</Text>
        </View>
        
        <View style={styles.dailyCounter}>
          <Text style={styles.counterText}>{remainingChats}/30</Text>
        </View>
      </View>
      
      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesListContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {/* 输入区域 */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={apiConfigured ? "和你的宠物聊聊天..." : "API未配置，将使用模拟响应"}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.sendButton, (inputText.trim() === '' || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={inputText.trim() === '' || isLoading || hasReachedDailyLimit()}
          >
            {isLoading ? (
              <Ionicons name="time" size={24} color="gray" />
            ) : (
              <Ionicons name="send" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {/* API 配置提醒 */}
      {!apiConfigured && (
        <View style={styles.apiAlert}>
          <Text style={styles.apiAlertText}>⚠️ OpenAI API 未配置</Text>
        </View>
      )}
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  dailyCounter: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesListContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 5,
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginTop: 5,
  },
  inputContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    fontSize: 16,
    paddingVertical: 8,
    paddingRight: 10,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  apiAlert: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  apiAlertText: {
    color: '#856404',
    fontSize: 12,
  },
});
