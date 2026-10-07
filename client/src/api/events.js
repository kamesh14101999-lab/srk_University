import client from './client';
import { createResource } from './resource';

export const eventsApi = {
  ...createResource('/events'),
  register: (id) => client.post(`/events/${id}/register`).then((r) => r.data),
};
