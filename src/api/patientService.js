import { json, request } from './client';

export const patientService = {
  getProfile: () => request('/patients/me'),
  updateProfile: (payload) => json('PUT', '/patients/me', payload),
  uploadMedicalHistory: (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/patients/me/medical-history', { method: 'POST', body: form });
  },
  getMedicalHistoryDownload: (publicId) => request(`/patients/me/medical-history/download?${new URLSearchParams({ publicId })}`),
};

export default patientService;
