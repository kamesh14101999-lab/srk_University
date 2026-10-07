import client from './client';

export const marksApi = {
  getSheet: (exam) => client.get('/marks/sheet', { params: { exam } }).then((r) => r.data),
  saveSheet: (payload) => client.put('/marks/sheet', payload).then((r) => r.data),
};
