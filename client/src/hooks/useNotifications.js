import { useContext } from 'react';
import { NotificationsContext } from '../context/ToastContext';

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside ToastProvider');
  return ctx;
}
