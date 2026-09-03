import { request } from './client';

export const queueService = {
  getAppointmentStatus: (appointmentId) => request(`/appointments/${appointmentId}/queue`),
  getDepartmentAnalytics: (departmentId) => request(`/admin/queue/departments/${departmentId}`),
  recalculateDepartment: (departmentId) => request(`/admin/queue/departments/${departmentId}/recalc`, { method: 'POST' }),
};

export default queueService;
