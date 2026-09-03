import { request } from './client';

export const healthService = {
  health: () => request('/health'),
  readiness: () => request('/ready'),
};

export default healthService;
