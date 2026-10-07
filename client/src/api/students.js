import client from './client';
import { createResource } from './resource';

export const studentsApi = {
  ...createResource('/students'),
  addRemark: (id, text) => client.post(`/students/${id}/remarks`, { text }).then((r) => r.data),
  attendance: (id) => client.get(`/students/${id}/attendance`).then((r) => r.data),
  marks: (id) => client.get(`/students/${id}/marks`).then((r) => r.data),
  results: (id) => client.get(`/students/${id}/results`).then((r) => r.data),
  activities: (id) => client.get(`/students/${id}/activities`).then((r) => r.data),
};
