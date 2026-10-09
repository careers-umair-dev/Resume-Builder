import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => { cleanup(); localStorage.clear(); });

window.matchMedia ||= (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
window.ResizeObserver ||= class { observe() {} unobserve() {} disconnect() {} };
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
window.IntersectionObserver ||= class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
