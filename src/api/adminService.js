import { json, request } from './client';

const query = (params = {}) => new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString();

export const adminService = {
  getDashboardStats: () => request('/admin/dashboard/stats'),
  getQueueAnalytics: (departmentId) => request(`/admin/queue/departments/${departmentId}`),
  recalculateQueue: (departmentId) => request(`/admin/queue/departments/${departmentId}/recalc`, { method: 'POST' }),
  getPredictionReports: (params) => request(`/admin/ai/predictions?${query(params)}`),
  getAuditLogs: (params = {}) => request(`/admin/audit-logs?${query({ page: 0, size: 20, ...params })}`),
  exportTrainingData: (from, to) => request(`/admin/ai/training-data?${query({ from, to })}`, { headers: { Accept: 'text/csv' } }),
  retryNotification: (notificationId) => request(`/admin/notifications/${notificationId}/retry`, { method: 'POST' }),
  approveDoctor: (userId, hospitalId, approved) => request(`/admin/doctors/${userId}/approve?${query({ hospitalId, approved })}`, { method: 'PATCH' }),
  createAdmin: (payload) => json('POST', '/admin/users/admin', payload),
  createDoctor: (payload) => json('POST', '/admin/users/doctor', payload),
};

export default adminService;
