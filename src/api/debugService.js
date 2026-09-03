import { request } from './client';

export const debugService = {
  authInfo: () => request('/debug/auth'),
};

export default debugService;
