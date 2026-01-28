import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import chatService from '../../services/chat/chatService';
import type {
  ChatMessage,
  DirectChat,
  ChatGroup,
  ChatNotification,
} from '../../services/chat/chatService';

interface ChatContextType {
  // Direct Chats
  directChats: DirectChat[];
  selectedDirectChat: DirectChat | null;
  setSelectedDirectChat: (chat: DirectChat | null) => void;
  loadDirectChats: () => Promise<void>;
  createDirectChat: (userId: string) => Promise<void>;

  // Group Chats
  groupChats: ChatGroup[];
  selectedGroupChat: ChatGroup | null;
  setSelectedGroupChat: (group: ChatGroup | null) => void;
  loadGroupChats: () => Promise<void>;
  createGroupChat: (
    name: string,
    description: string,
    memberIds: string[],
  ) => Promise<void>;

  // Messages
  messages: ChatMessage[];
  loadMessages: (chatId: string, isGroup?: boolean) => Promise<void>;
  sendMessage: (content: string, isGroup?: boolean) => Promise<void>;
  typingUsers: Set<string>;

  // Notifications
  notifications: ChatNotification[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;

  // UI State
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  activeTab: 'direct' | 'group';
  setActiveTab: (tab: 'direct' | 'group') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [directChats, setDirectChats] = useState<DirectChat[]>([]);
  const [groupChats, setGroupChats] = useState<ChatGroup[]>([]);
  const [selectedDirectChat, setSelectedDirectChat] = useState<DirectChat | null>(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'group'>('direct');

  // Initialize chat service with token
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      chatService.initializeSocket(token);
    }
  }, []);

  // Load direct chats
  const loadDirectChats = useCallback(async () => {
    try {
      setIsLoadingChats(true);
      const chats = await chatService.getDirectChats();
      setDirectChats(chats);
    } catch (error) {
      console.error('Error loading direct chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  // Load group chats
  const loadGroupChats = useCallback(async () => {
    try {
      setIsLoadingChats(true);
      const chats = await chatService.getChatGroups();
      setGroupChats(chats);
    } catch (error) {
      console.error('Error loading group chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  // Load messages
  const loadMessages = useCallback(async (chatId: string, isGroup = false) => {
    try {
      setIsLoadingMessages(true);
      setMessages([]);

      let msgs: ChatMessage[];
      if (isGroup) {
        msgs = await chatService.getGroupMessages(chatId);
        chatService.joinGroup(chatId);
      } else {
        msgs = await chatService.getDirectChatMessages(chatId);
        chatService.joinDirectChat(chatId);
      }

      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (content: string, isGroup = false) => {
      try {
        if (isGroup && selectedGroupChat) {
          await chatService.sendGroupMessage(selectedGroupChat.id, content);
          chatService.sendGroupMessageViaSocket(selectedGroupChat.id, content);
        } else if (!isGroup && selectedDirectChat) {
          await chatService.sendDirectMessage(selectedDirectChat.id, content);
          chatService.sendDirectMessageViaSocket(selectedDirectChat.id, content);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [selectedDirectChat, selectedGroupChat],
  );

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const notifs = await chatService.getNotifications();
      const count = await chatService.getUnreadNotificationsCount();
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await chatService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Create direct chat
  const createDirectChat = useCallback(
    async (userId: string) => {
      try {
        const chat = await chatService.createDirectChat(userId);
        setDirectChats((prev) => [chat, ...prev]);
        setSelectedDirectChat(chat);
      } catch (error) {
        console.error('Error creating direct chat:', error);
      }
    },
    [],
  );

  // Create group chat
  const createGroupChat = useCallback(
    async (name: string, description: string, memberIds: string[]) => {
      try {
        const group = await chatService.createChatGroup(name, description, memberIds);
        setGroupChats((prev) => [group, ...prev]);
        setSelectedGroupChat(group);
      } catch (error) {
        console.error('Error creating group chat:', error);
      }
    },
    [],
  );

  // Setup WebSocket listeners
  useEffect(() => {
    const socket = chatService.getSocket();

    if (socket) {
      // Direct chat listeners
      chatService.onDirectMessageReceived((message) => {
        setMessages((prev) => [...prev, message]);
      });

      chatService.onDirectUserTyping(({ userId, isTyping }) => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          if (isTyping) {
            updated.add(userId);
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      });

      // Group chat listeners
      chatService.onGroupMessageReceived((message) => {
        setMessages((prev) => [...prev, message]);
      });

      chatService.onGroupUserTyping(({ userId, isTyping }) => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          if (isTyping) {
            updated.add(userId);
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      });

      // Notification listeners
      chatService.onNotificationReceived((notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDirectChats();
    loadGroupChats();
    loadNotifications();
  }, [loadDirectChats, loadGroupChats, loadNotifications]);

  const value: ChatContextType = {
    directChats,
    selectedDirectChat,
    setSelectedDirectChat,
    loadDirectChats,
    createDirectChat,
    groupChats,
    selectedGroupChat,
    setSelectedGroupChat,
    loadGroupChats,
    createGroupChat,
    messages,
    loadMessages,
    sendMessage,
    typingUsers,
    notifications,
    unreadCount,
    loadNotifications,
    markNotificationAsRead,
    isLoadingChats,
    isLoadingMessages,
    activeTab,
    setActiveTab,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
