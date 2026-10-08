import client from './client';
import { createResource } from './resource';

export const teachersApi = {
  ...createResource('/teachers'),
  workload: (id) => client.get(`/teachers/${id}/workload`).then((r) => r.data),
  resetPassword: (id, newPassword) =>
    client.post(`/teachers/${id}/reset-password`, newPassword ? { newPassword } : {}).then((r) => r.data),
};
