import api from './api';

export const uploadService = {
  photo: (file) => {
    const form = new FormData();
    form.append('photo', file);
    return api.post('/uploads/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.url);
  },
};
