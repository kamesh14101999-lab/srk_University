import client from './client';

export const universityApi = {
  get: () => client.get('/university').then((r) => r.data),
  update: (payload) => client.put('/university', payload).then((r) => r.data),
};
