import client from './client';
import { createResource } from './resource';

export const examsApi = {
  ...createResource('/exams'),
  publish: (id) => client.patch(`/exams/${id}/publish`).then((r) => r.data),
  unpublish: (id) => client.patch(`/exams/${id}/unpublish`).then((r) => r.data),
};
