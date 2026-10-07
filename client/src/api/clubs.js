import client from './client';
import { createResource } from './resource';

export const clubsApi = {
  ...createResource('/clubs'),
  members: (id) => client.get(`/clubs/${id}/members`).then((r) => r.data),
  addMember: (id, payload) => client.post(`/clubs/${id}/members`, payload).then((r) => r.data),
  removeMember: (id, studentId) => client.delete(`/clubs/${id}/members/${studentId}`).then((r) => r.data),
};
