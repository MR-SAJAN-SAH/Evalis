import io, { Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  chatId?: string;
  chatGroupId?: string;
  senderId: string;
  content: string;
  messageType: string;
  fileUrl?: string;
  fileName?: string;
  readByUserIds: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender?: {
    id: string;
    name: string;
  };
}

export interface DirectChat {
  id: string;
  user1Id: string;
  user2Id: string;
  organizationId: string;
  lastMessageTime?: Date;
  createdAt: Date;
  otherUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  organizationId: string;
  profilePicture?: string;
  memberCount: number;
  lastMessageTime?: Date;
  createdAt: Date;
  members?: ChatGroupMember[];
}

export interface ChatGroupMember {
  id: string;
  userId: string;
  invitationStatus: 'pending' | 'accepted' | 'rejected';
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ChatNotification {
  id: string;
  userId: string;
  notificationType: string;
  relatedId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender?: {
    id: string;
    name: string;
  };
}

const API_BASE_URL = (() => {
  const backend = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // If it's a full URL (http/https), append /api, otherwise use as-is (for relative paths)
  if (backend.startsWith('http')) {
    return `${backend}/api`;
  }
  return backend;
})();
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class ChatService {
  private socket: Socket | null = null;
  private token: string = '';

  // Helper method to get token from either instance or sessionStorage
  private getToken(): string {
    return this.token || sessionStorage.getItem('accessToken') || '';
  }

  initializeSocket(token: string) {
    this.token = token;
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(`${WS_URL}/chat`, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ORGANIZATION USERS METHODS
  async getOrganizationUsers(): Promise<any[]> {
    try {
      const token = this.getToken();
      console.log('🔍 [ChatService] Getting organization users...');
      console.log('📌 [ChatService] Token available:', token ? '✅ Yes' : '❌ No');
      
      if (!token) {
        console.error('❌ [ChatService] No token available. Cannot fetch organization users.');
        return [];
      }

      const requestUrl = `${API_BASE_URL}/chat/organization-users`;
      console.log('📝 [ChatService] Request URL:', requestUrl);
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📊 [ChatService] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ChatService] Failed to fetch organization users:');
        console.error('   Status:', response.status);
        console.error('   Error:', errorText);
        return [];
      }
      
      const data = await response.json();
      console.log('✅ [ChatService] Successfully fetched organization users:', data.length, 'users');
      console.log('📋 [ChatService] Users:', data);
      
      return data;
    } catch (error) {
      console.error('❌ [ChatService] Error fetching organization users:', error);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
        console.error('   Stack:', error.stack);
      }
      return [];
    }
  }

  // DIRECT CHAT METHODS
  async getDirectChats(): Promise<DirectChat[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/direct-chats`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
      if (!response.ok) {
        console.warn('Failed to fetch direct chats:', response.status);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching direct chats:', error);
      return [];
    }
  }

  async createDirectChat(userId: string): Promise<DirectChat> {
    const response = await fetch(`${API_BASE_URL}/chat/direct-chats/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }

  async getDirectChatMessages(chatId: string, skip: number = 0, take: number = 50): Promise<ChatMessage[]> {
    const response = await fetch(
      `${API_BASE_URL}/chat/direct-chats/${chatId}/messages?skip=${skip}&take=${take}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    return response.json();
  }

  async sendDirectMessage(chatId: string, content: string, messageType: string = 'text'): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE_URL}/chat/direct-chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ content, messageType }),
    });
    return response.json();
  }

  sendDirectMessageViaSocket(chatId: string, content: string, messageType: string = 'text') {
    if (this.socket) {
      this.socket.emit('direct:send-message', { chatId, content, messageType });
    }
  }

  joinDirectChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('direct:join-chat', { chatId });
    }
  }

  leaveDirectChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('direct:leave-chat', { chatId });
    }
  }

  onDirectMessageReceived(callback: (message: ChatMessage) => void) {
    if (this.socket) {
      this.socket.on('direct:message-received', callback);
    }
  }

  onDirectUserTyping(callback: (data: { userId: string; chatId: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on('direct:user-typing', callback);
    }
  }

  sendDirectTypingStatus(chatId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('direct:typing', { chatId, isTyping });
    }
  }

  async archiveChat(chatId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/direct-chats/${chatId}/archive`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async blockUser(chatId: string, blockUserId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/direct-chats/${chatId}/block/${blockUserId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async searchDirectChatMessages(chatId: string, query: string): Promise<ChatMessage[]> {
    const response = await fetch(`${API_BASE_URL}/chat/direct-chats/${chatId}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response.json();
  }

  // GROUP CHAT METHODS
  async getChatGroups(): Promise<ChatGroup[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/groups`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      if (!response.ok) {
        console.warn('Failed to fetch chat groups:', response.status);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching chat groups:', error);
      return [];
    }
  }

  async createChatGroup(
    name: string,
    description: string,
    memberIds: string[],
    profilePicture?: string,
  ): Promise<ChatGroup> {
    const response = await fetch(`${API_BASE_URL}/chat/groups/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ name, description, memberIds, profilePicture }),
    });
    return response.json();
  }

  async getChatGroupDetails(groupId: string): Promise<ChatGroup> {
    const response = await fetch(`${API_BASE_URL}/chat/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response.json();
  }

  async getGroupMessages(groupId: string, skip: number = 0, take: number = 50): Promise<ChatMessage[]> {
    const response = await fetch(
      `${API_BASE_URL}/chat/groups/${groupId}/messages?skip=${skip}&take=${take}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    return response.json();
  }

  async sendGroupMessage(groupId: string, content: string, messageType: string = 'text'): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE_URL}/chat/groups/${groupId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ content, messageType }),
    });
    return response.json();
  }

  sendGroupMessageViaSocket(groupId: string, content: string, messageType: string = 'text') {
    if (this.socket) {
      this.socket.emit('group:send-message', { groupId, content, messageType });
    }
  }

  joinGroup(groupId: string) {
    if (this.socket) {
      this.socket.emit('group:join-group', { groupId });
    }
  }

  leaveGroup(groupId: string) {
    if (this.socket) {
      this.socket.emit('group:leave-group', { groupId });
    }
  }

  onGroupMessageReceived(callback: (message: ChatMessage) => void) {
    if (this.socket) {
      this.socket.on('group:message-received', callback);
    }
  }

  onGroupUserTyping(callback: (data: { userId: string; groupId: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on('group:user-typing', callback);
    }
  }

  sendGroupTypingStatus(groupId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('group:typing', { groupId, isTyping });
    }
  }

  async inviteMembers(groupId: string, memberIds: string[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/chat/groups/${groupId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ memberIds }),
    });
    return response.json();
  }

  async acceptGroupInvitation(groupId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/groups/${groupId}/invitations/accept`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async rejectGroupInvitation(groupId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/groups/${groupId}/invitations/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async updateGroupInfo(groupId: string, name?: string, description?: string): Promise<ChatGroup> {
    const response = await fetch(`${API_BASE_URL}/chat/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ name, description }),
    });
    return response.json();
  }

  async muteGroup(groupId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/groups/${groupId}/mute`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async unmuteGroup(groupId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/groups/${groupId}/unmute`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async searchGroupMessages(groupId: string, query: string): Promise<ChatMessage[]> {
    const response = await fetch(
      `${API_BASE_URL}/chat/groups/${groupId}/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    return response.json();
  }

  // NOTIFICATION METHODS
  async getNotifications(skip: number = 0, take: number = 20): Promise<ChatNotification[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/notifications?skip=${skip}&take=${take}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      if (!response.ok) {
        console.warn('Failed to fetch notifications:', response.status);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async getUnreadNotificationsCount(): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      if (!response.ok) {
        console.warn('Failed to fetch unread count:', response.status);
        return 0;
      }
      const data = await response.json();
      return data.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/notifications/${notificationId}/mark-read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/notifications/mark-all-read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chat/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  onNotificationReceived(callback: (notification: ChatNotification) => void) {
    if (this.socket) {
      this.socket.on('notification:group-invitation', callback);
    }
  }
}

export default new ChatService();
