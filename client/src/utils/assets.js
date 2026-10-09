import { API_URL } from '../constants/app';

const origin = /^https?:\/\//i.test(API_URL) ? new URL(API_URL).origin : '';
export const assetUrl = (p) => (!p ? '' : /^https?:\/\//i.test(p) ? p : `${origin}${p.startsWith('/') ? '' : '/'}${p}`);
