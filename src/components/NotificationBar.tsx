'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const NotificationBar = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: '',
    message: ''
  });

  // Update notification content when translations are available
  useEffect(() => {
    setNotificationContent({
      title: t('notification.title'),
      message: t('notification.message')
    });
  }, [t]);

  useEffect(() => {
    // Show popup after 2 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Auto-dismiss after 10 seconds
    const autoDismissTimer = setTimeout(() => {
      setIsVisible(false);
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoDismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Don't render if content is not loaded yet
  if (!notificationContent.title || !notificationContent.message) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 z-[60] max-w-sm transition-all duration-500 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="bg-orange-600 text-white p-4 rounded-lg shadow-xl border border-orange-500">
        <div className="flex items-start space-x-3">
          <Bell className="w-5 h-5 text-yellow-300 animate-pulse flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm">
              <span className="font-bold">{notificationContent.title}</span>{' '}
              <span className="text-orange-100">
                {notificationContent.message}
              </span>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-orange-700 rounded transition-colors duration-200 flex-shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;