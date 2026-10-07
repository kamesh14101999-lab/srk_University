import client from './client';

export const analyticsApi = {
  admin: () => client.get('/analytics/admin').then((r) => r.data),
  teacher: () => client.get('/analytics/teacher').then((r) => r.data),
  student: () => client.get('/analytics/student').then((r) => r.data),
};
