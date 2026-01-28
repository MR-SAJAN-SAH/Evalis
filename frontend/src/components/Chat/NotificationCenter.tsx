import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/chat/ChatContext';
import './NotificationCenter.css';

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { notifications, loadNotifications, markNotificationAsRead, unreadCount } = useChat();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    // TODO: Handle notification action (navigate to group, etc.)
    if (notification.notificationType === 'group_invitation') {
      console.log('Navigate to group:', notification.relatedId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'group_invitation':
        return '👥';
      case 'new_message':
        return '💬';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  };

  const getNotificationMessage = (notification: any) => {
    switch (notification.notificationType) {
      case 'group_invitation':
        return `You have been invited to join a group`;
      case 'new_message':
        return `New message from ${notification.sender?.name}`;
      case 'mention':
        return `${notification.sender?.name} mentioned you`;
      default:
        return notification.content;
    }
  };

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="notification-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.notificationType)}
              </div>
              <div className="notification-content">
                <p className="notification-text">
                  {getNotificationMessage(notification)}
                </p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!notification.isRead && <span className="unread-dot">●</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
