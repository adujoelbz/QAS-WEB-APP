import { request } from './client';

export const notificationService = {
  retryFailed: (notificationId) => request(`/admin/notifications/${notificationId}/retry`, { method: 'POST' }),
  retry: (notificationId) => request(`/admin/notifications/${notificationId}/retry`, { method: 'POST' }),
};

export default notificationService;
