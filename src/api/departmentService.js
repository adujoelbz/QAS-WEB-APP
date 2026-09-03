import { json, request } from './client';

const query = (params = {}) => new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString();

export const departmentService = {
  listPublic: (params = {}) => request(`/public/departments?${query(params)}`),
  getPublicById: (id) => request(`/public/departments/${id}`),
  listSpecialties: () => request('/public/specialties'),
  create: (hospitalId, payload) => json('POST', `/admin/hospitals/${hospitalId}/departments`, payload),
  update: (id, payload) => json('PUT', `/admin/departments/${id}`, payload),
  remove: (id) => request(`/admin/departments/${id}`, { method: 'DELETE' }),
};

export default departmentService;
