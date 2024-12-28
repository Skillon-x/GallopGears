import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Bell, Check, Filter, Trash2 } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/users/notifications');
      
      if (response.data?.success && Array.isArray(response.data?.notifications)) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications([]);
        setError('No notifications available');
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
      setNotifications([]);
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setError(null);
      await axios.put('/api/users/notifications/read-all');
      if (Array.isArray(notifications)) {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      }
    } catch (err) {
      console.error('Mark as read error:', err);
      setError(err.response?.data?.message || 'Failed to mark notifications as read');
    }
  };

  const filteredNotifications = Array.isArray(notifications) 
    ? notifications.filter(notif => {
        if (filter === 'unread') return !notif.isRead;
        if (filter === 'read') return notif.isRead;
        return true;
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-tertiary">Notifications</h1>
            <p className="text-tertiary/70">Stay updated with your latest activities</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <Filter className="w-4 h-4 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {/* Mark All as Read Button */}
            <button
              onClick={markAllAsRead}
              disabled={!Array.isArray(notifications) || notifications.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-tertiary hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <Bell className="w-12 h-12 text-tertiary/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-tertiary mb-2">No notifications</h3>
              <p className="text-tertiary/70">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id || Math.random()}
                className={`bg-white p-6 rounded-xl shadow-sm border ${
                  notification.isRead ? 'border-gray-100' : 'border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${notification.isRead ? 'text-tertiary' : 'text-primary'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-tertiary/70 mt-1">{notification.message}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="text-xs text-tertiary/50">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {notification.type && (
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {notification.type}
                        </span>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 