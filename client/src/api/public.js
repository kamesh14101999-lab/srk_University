import client from './client';

export const publicApi = {
  university: () => client.get('/public/university').then((r) => r.data),
  departments: () => client.get('/public/departments').then((r) => r.data),
  courses: () => client.get('/public/courses').then((r) => r.data),
  faculty: () => client.get('/public/faculty').then((r) => r.data),
  facilities: () => client.get('/public/facilities').then((r) => r.data),
  events: () => client.get('/public/events').then((r) => r.data),
  fests: () => client.get('/public/fests').then((r) => r.data),
  clusters: () => client.get('/public/clusters').then((r) => r.data),
  sports: () => client.get('/public/sports').then((r) => r.data),
  announcements: () => client.get('/public/announcements').then((r) => r.data),
  calendar: () => client.get('/public/calendar').then((r) => r.data),
};
