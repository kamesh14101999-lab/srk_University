import client from './client';

export const attendanceApi = {
  getSheet: (assignment, date) => client.get('/attendance/sheet', { params: { assignment, date } }).then((r) => r.data),
  saveSheet: (payload) => client.put('/attendance/sheet', payload).then((r) => r.data),
  summary: (params) => client.get('/attendance/summary', { params }).then((r) => r.data),
  analytics: (params) => client.get('/attendance/analytics', { params }).then((r) => r.data),
};
