import { json } from './client';

export const authService = {
  login: (credentials) => json('POST', '/auth/login', credentials),
  register: (payload) => json('POST', '/auth/register', payload),
};

export default authService;
