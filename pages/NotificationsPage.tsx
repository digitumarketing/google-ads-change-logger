import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Bell, FileText, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';
import { NotificationAction, UserRole } from '../types';
import Card from '../components/ui/Card';

const getActionIcon = (action: NotificationAction) => {
  switch (action) {
    case NotificationAction.CreateLog:
      return <Plus className="text-green-500" size={18} />;
    case NotificationAction.UpdateLog:
      return <Edit className="text-blue-500" size={18} />;
    case NotificationAction.DeleteLog:
      return <Trash2 className="text-red-500" size={18} />;
    case NotificationAction.CreateComment:
      return <MessageSquare className="text-blue-500" size={18} />;
    case NotificationAction.DeleteComment:
      return <Trash2 className="text-red-400" size={18} />;
    default:
      return <FileText className="text-gray-500" size={18} />;
  }
};

const getActionColor = (action: NotificationAction) => {
  switch (action) {
    case NotificationAction.CreateLog:
      return 'bg-green-100 dark:bg-green-900/20';
    case NotificationAction.UpdateLog:
      return 'bg-blue-100 dark:bg-blue-900/20';
    case NotificationAction.DeleteLog:
      return 'bg-red-100 dark:bg-red-900/20';
    case NotificationAction.CreateComment:
      return 'bg-blue-50 dark:bg-blue-900/10';
    case NotificationAction.DeleteComment:
      return 'bg-red-50 dark:bg-red-900/10';
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
};

const NotificationsPage: React.FC = () => {
  const { notifications, currentUser, deleteNotification } = useAppContext();
  const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setDeletingNotificationId(null);
    } catch (error) {
      alert('Failed to delete notification. Please try again.');
      setDeletingNotificationId(null);
    }
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bell className="mr-3" size={28} />
            Activity Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all changes and activities across your campaigns
          </p>
        </div>
      </div>

      <Card>
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No activity yet
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              When team members create logs or add comments, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 sticky top-0 bg-white dark:bg-gray-800 py-2">
                  {date === new Date().toLocaleDateString() ? 'Today' : date}
                </h3>
                <div className="space-y-3">
                  {notifs.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${getActionColor(notification.actionType)} group`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(notification.actionType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-semibold">{notification.userName}</span>
                          {' '}
                          <span className="text-gray-600 dark:text-gray-300">
                            {notification.description}
                          </span>
                        </p>
                        {notification.metadata?.commentPreview && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                            "{notification.metadata.commentPreview}..."
                          </p>
                        )}
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      {isSuperAdmin && (
                        <div className="flex-shrink-0">
                          {deletingNotificationId === notification.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeletingNotificationId(null)}
                                className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingNotificationId(notification.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
                              title="Delete notification"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
