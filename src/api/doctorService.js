import { json, request } from './client';

const query = (params = {}) => new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString();

export const doctorService = {
  getProfile: () => request('/doctors/me'),
  updateAvailability: (payload) => json('PUT', '/doctors/me/availability', payload),
  setConsultationDuration: (payload) => json('PUT', '/doctors/me/consultation-duration', payload),
  getSchedule: (dateFrom, dateTo) => request(`/doctors/me/schedule?${query({ dateFrom, dateTo })}`),
  getAppointments: (params = {}) => request(`/doctors/me/appointments?${query(params)}`),
  getAppointmentsByDoctor: (params = {}) => request(`/doctors/appointments?${query(params)}`),
  updateAppointmentStatus: (appointmentId, status, actualWaitTime) => request(`/doctors/appointments/${appointmentId}/status?${query({ status, actualWaitTime })}`, { method: 'PATCH' }),
  startConsultation: (appointmentId) => request(`/doctors/appointments/${appointmentId}/start`, { method: 'POST' }),
  getMedicalHistoryDownload: (appointmentId, publicId) => request(`/doctors/appointments/${appointmentId}/medical-history/download?${query({ publicId })}`),
};

export default doctorService;
