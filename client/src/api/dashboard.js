import client from './client';

export const dashboardApi = {
  admin: () => client.get('/dashboard/admin').then((r) => r.data),
  teacher: () => client.get('/dashboard/teacher').then((r) => r.data),
  student: () => client.get('/dashboard/student').then((r) => r.data),
};
