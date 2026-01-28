import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  maxVisible?: number;
}

/**
 * NotificationCenter Component - Manages exam-related notifications
 * Displays system notifications with actions and timestamps
 */
const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  maxVisible = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifications = notifications.slice(0, maxVisible);

  const getNotificationColor = (type: string) => {
    const colors: { [key: string]: string } = {
      success: '#10b981',
      info: '#06b6d4',
      warning: '#f59e0b',
      error: '#ef4444',
    };
    return colors[type] || '#6b7280';
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div className="notification-center">
      <button
        className="notification-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <>
          <div className="notification-backdrop" onClick={() => setIsOpen(false)}></div>
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <FaTimes />
              </button>
            </div>

            <div className="notification-list">
              {visibleNotifications.length > 0 ? (
                visibleNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item notification-${notification.type} ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      <span
                        style={{ backgroundColor: getNotificationColor(notification.type) }}
                      ></span>
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {notification.action && (
                      <button
                        className="notification-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.action?.onClick();
                        }}
                      >
                        {notification.action.label}
                      </button>
                    )}
                    {onDismiss && (
                      <button
                        className="notification-dismiss"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(notification.id);
                        }}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-notifications">
                  <p>No notifications yet</p>
                </div>
              )}
            </div>

            {notifications.length > maxVisible && (
              <div className="notification-footer">
                <a href="#notifications">View all notifications</a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
