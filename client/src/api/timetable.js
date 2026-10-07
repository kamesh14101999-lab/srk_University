import client from './client';

export const timetableApi = {
  me: () => client.get('/timetable/me').then((r) => r.data),
  list: (params) => client.get('/timetable', { params }).then((r) => r.data),
  create: (data) => client.post('/timetable', data).then((r) => r.data),
  update: (id, data) => client.patch(`/timetable/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/timetable/${id}`).then((r) => r.data),
};
