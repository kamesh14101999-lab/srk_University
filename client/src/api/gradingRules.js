import client from './client';

export const gradingRulesApi = {
  list: () => client.get('/grading-rules').then((r) => r.data),
  replaceAll: (rules) => client.put('/grading-rules', { rules }).then((r) => r.data),
};
