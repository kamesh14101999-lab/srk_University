import client from './client';

// Standard REST helpers for a resource mounted at `path` (e.g. '/departments').
export function createResource(path) {
  return {
    list: (params) => client.get(path, { params }).then((r) => r.data),
    get: (id) => client.get(`${path}/${id}`).then((r) => r.data),
    create: (data) => client.post(path, data).then((r) => r.data),
    update: (id, data) => client.patch(`${path}/${id}`, data).then((r) => r.data),
    remove: (id) => client.delete(`${path}/${id}`).then((r) => r.data),
  };
}
