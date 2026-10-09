import api from './api';

export const resumeService = {
  list: (params) => api.get('/resumes', { params }).then((r) => r.data),
  stats: () => api.get('/resumes/stats').then((r) => r.data.stats),
  downloads: () => api.get('/resumes/downloads').then((r) => r.data.downloads),
  get: (id) => api.get(`/resumes/${id}`).then((r) => r.data.resume),
  create: (data) => api.post('/resumes', data).then((r) => r.data.resume),
  update: (id, data) => api.put(`/resumes/${id}`, data).then((r) => r.data.resume),
  remove: (id) => api.delete(`/resumes/${id}`).then((r) => r.data),
  duplicate: (id) => api.post(`/resumes/${id}/duplicate`).then((r) => r.data.resume),
  pdf: async (id, { inline = false } = {}) => {
    const res = await api.get(`/resumes/${id}/pdf`, { params: inline ? { disposition: 'inline' } : {}, responseType: 'blob', timeout: 60000 });
    const match = /filename="([^"]+)"/.exec(res.headers['content-disposition'] || '');
    return { blob: res.data, filename: match ? match[1] : 'resume.pdf' };
  },
};
