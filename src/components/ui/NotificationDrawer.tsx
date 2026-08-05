"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  count: number;
  timestamp: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationDrawer({ isOpen, onClose, onUnreadCountChange }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load state from local storage on mount
  useEffect(() => {
    const savedRead = localStorage.getItem("read_notifications");
    const savedDeleted = localStorage.getItem("deleted_notifications");
    if (savedRead) setReadIds(JSON.parse(savedRead));
    if (savedDeleted) setDeletedIds(JSON.parse(savedDeleted));
    
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate visible and unread
  const visibleNotifications = notifications.filter(n => !deletedIds.includes(n.id));
  const unreadCount = visibleNotifications.filter(n => !readIds.includes(n.id)).length;

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem("read_notifications", JSON.stringify(newReadIds));
  };

  const deleteNotification = (id: string) => {
    const newDeletedIds = [...deletedIds, id];
    setDeletedIds(newDeletedIds);
    localStorage.setItem("deleted_notifications", JSON.stringify(newDeletedIds));
  };

  const markAllAsRead = () => {
    const allVisibleIds = visibleNotifications.map(n => n.id);
    const newReadIds = Array.from(new Set([...readIds, ...allVisibleIds]));
    setReadIds(newReadIds);
    localStorage.setItem("read_notifications", JSON.stringify(newReadIds));
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-50 shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
             <button onClick={fetchNotifications} className="p-2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition" title="Refresh">
              <i className={`ri-refresh-line text-[17px] ${loading ? 'animate-spin text-indigo-600' : ''}`}></i>
            </button>
            <button onClick={onClose} className="p-2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
              <i className="ri-close-line text-[20px]"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {visibleNotifications.length > 0 && unreadCount > 0 && (
            <div className="flex justify-end mb-2">
              <button onClick={markAllAsRead} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                Mark all as read
              </button>
            </div>
          )}

          {loading && notifications.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-slate-400">
               <i className="ri-loader-4-line text-4xl mb-2 animate-spin"></i>
               <p className="text-sm font-medium">Loading...</p>
             </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <i className="ri-notification-badge-line text-4xl mb-2 opacity-50"></i>
              <p className="text-sm font-medium">All caught up!</p>
            </div>
          ) : (
            visibleNotifications.map((notification) => {
              const isRead = readIds.includes(notification.id);
              return (
                <div 
                  key={notification.id} 
                  className={`relative p-4 rounded-xl border transition-all duration-200 group ${
                    isRead 
                      ? 'bg-white border-slate-200 shadow-sm opacity-70' 
                      : 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50'
                  }`}
                >
                  {!isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-600"></span>
                  )}
                  
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'due' ? 'bg-red-50 text-red-600 border border-red-100' :
                      notification.type === 'upcoming' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      <i className={`text-lg ${
                        notification.type === 'due' ? 'ri-money-dollar-circle-line' :
                        notification.type === 'upcoming' ? 'ri-calendar-event-line' :
                        'ri-user-add-line'
                      }`}></i>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        {dayjs(notification.timestamp).fromNow()}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isRead && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <i className="ri-check-double-line"></i> Mark read
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center gap-1 ml-auto"
                        >
                          <i className="ri-delete-bin-line"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
