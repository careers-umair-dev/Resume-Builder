import * as pdfjs from 'pdfjs-dist/build/pdf.js';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
export default pdfjs;
