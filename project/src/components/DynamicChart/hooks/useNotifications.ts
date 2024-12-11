import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const notificationSound = new Audio('/notification.mp3');
const originalTitle = document.title;
let titleInterval: NodeJS.Timeout;

export const useNotifications = () => {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showDesktopNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        requireInteraction: true,
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, []);

  const triggerNotification = useCallback((added: any[], changed: any[]) => {
    setBellAnimating(true);
    setShowNotification(true);
    notificationSound.play().catch(console.error);

    const message = `${added.length} row(s) added, ${changed.length} row(s) updated`;
    const time = new Date().toLocaleTimeString();

    toast(message, {
      description: `New data received at ${time}`,
      action: {
        label: 'Close',
        onClick: () => {
          toast.dismiss();
          setBellAnimating(false);
        },
      },
    });

    if (notificationEnabled) {
      showDesktopNotification('Data Update', `${message} at ${time}`);
    }

    setTimeout(() => {
      setBellAnimating(false);
      setShowNotification(false);
    }, 2000);
  }, [notificationEnabled, showDesktopNotification]);

  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await requestNotificationPermission();
      setNotificationEnabled(granted);
    };
    setupNotifications();

    return () => {
      clearInterval(titleInterval);
      document.title = originalTitle;
    };
  }, []);

  return {
    notificationEnabled,
    showNotification,
    bellAnimating,
    triggerNotification,
    requestNotificationPermission,
  };
};