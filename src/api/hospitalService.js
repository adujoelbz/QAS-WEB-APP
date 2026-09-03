import { json, request } from './client';

const query = (params = {}) => new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString();

export const hospitalService = {
  search: (params = {}) => request(`/public/hospitals?${query({ page: 0, size: 20, ...params })}`),
  nearby: (params) => request(`/public/hospitals/nearby?${query({ page: 0, size: 20, ...params })}`),
  getById: (id) => request(`/public/hospitals/${id}`),
  create: (payload) => json('POST', '/admin/hospitals', payload),
  update: (id, payload) => json('PUT', `/admin/hospitals/${id}`, payload),
  remove: (id) => request(`/admin/hospitals/${id}`, { method: 'DELETE' }),
};

export default hospitalService;
