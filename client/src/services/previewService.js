import api from './api';

export const previewService = {
  /** Renders an unsaved draft on the server and returns the PDF bytes. */
  render: (payload, signal) => api.post('/resumes/preview', payload, { responseType: 'arraybuffer', signal, timeout: 60000 }).then((r) => r.data),
};
