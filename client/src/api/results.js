import client from './client';

export const resultsApi = {
  list: (params) => client.get('/results', { params }).then((r) => r.data),
  generate: (payload) => client.post('/results/generate', payload).then((r) => r.data),
  publish: (payload) => client.patch('/results/publish', payload).then((r) => r.data),
  unpublish: (payload) => client.patch('/results/unpublish', payload).then((r) => r.data),
};
