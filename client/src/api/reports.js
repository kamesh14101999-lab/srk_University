import client from './client';

export const reportsApi = {
  download: async (type, format, filters = {}) => {
    const res = await client.get(`/reports/${type}`, {
      params: { format, ...filters },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
