import { json, request } from './client';

const query = (params = {}) => new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString();

export const appointmentService = {
  create: (payload) => json('POST', '/appointments', payload),
  recommend: (params) => request(`/appointments/recommend?${query(params)}`, { method: 'POST' }),
  listMine: (params = {}) => request(`/appointments?${query({ page: 0, size: 10, ...params })}`),
  getById: (appointmentId) => request(`/appointments/${appointmentId}`),
  reschedule: (appointmentId, payload) => json('PUT', `/appointments/${appointmentId}/reschedule`, payload),
  cancel: (appointmentId) => request(`/appointments/${appointmentId}`, { method: 'DELETE' }),
  getQueue: (appointmentId) => request(`/appointments/${appointmentId}/queue`),
  joinStandby: (appointmentId) => request(`/appointments/${appointmentId}/standby`, { method: 'POST' }),
  confirm: (appointmentId) => request(`/appointments/${appointmentId}/confirm`, { method: 'PATCH' }),
  listAll: (params = {}) => request(`/admin/appointments?${query({ page: 0, size: 20, ...params })}`),
  approve: (appointmentId, doctorId) => request(`/admin/appointments/${appointmentId}/approve?${query({ doctorId })}`, { method: 'PATCH' }),
  reject: (appointmentId) => request(`/admin/appointments/${appointmentId}/reject`, { method: 'PATCH' }),
  listForDoctor: (params = {}) => request(`/doctors/appointments?${query(params)}`),
  updateDoctorStatus: (appointmentId, status, actualWaitTime) => request(`/doctors/appointments/${appointmentId}/status?${query({ status, actualWaitTime })}`, { method: 'PATCH' }),
  startConsultation: (appointmentId) => request(`/doctors/appointments/${appointmentId}/start`, { method: 'POST' }),
};

export default appointmentService;
