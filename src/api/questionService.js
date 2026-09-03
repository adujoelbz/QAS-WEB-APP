import { json, request } from './client';

export const questionService = {
  ask: (appointmentId, question) => json('POST', `/appointments/${appointmentId}/questions`, { question }),
  list: (appointmentId) => request(`/appointments/${appointmentId}/questions`),
  getById: (appointmentId, questionId) => request(`/appointments/${appointmentId}/questions/${questionId}`),
  answer: (appointmentId, questionId, answer) => json('POST', `/appointments/${appointmentId}/questions/${questionId}/answer`, { answer }),
};

export default questionService;
