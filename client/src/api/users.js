import client from './client';

export const usersApi = {
  list: (params) => client.get('/users', { params }).then((r) => r.data),
  setStatus: (id, isActive) => client.patch(`/users/${id}/status`, { isActive }).then((r) => r.data),
  resetPassword: (id, newPassword) =>
    client.patch(`/users/${id}/reset-password`, { newPassword }).then((r) => r.data),
};
