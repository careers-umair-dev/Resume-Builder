export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.isNetworkError) return 'Cannot reach the server. Check your connection and try again.';
  return err?.response?.data?.message || err?.message || fallback;
}

/** Server validation errors -> [{ field, message }] */
export const getFieldErrors = (err) => err?.response?.data?.errors || [];

/** Errors from responseType:'blob' requests arrive as Blobs; read the JSON message out of them. */
export async function getBlobErrorMessage(err, fallback = 'Could not generate the PDF. Please try again.') {
  const data = err?.response?.data;
  if (data && (typeof data.arrayBuffer === 'function' || typeof data.text === 'function') && typeof data.size === 'number') {
    try {
      const content = typeof data.text === 'function' ? await data.text() : await data.arrayBuffer();
      return decodeJsonMessage(content) || binaryRequestErrorMessage(err, fallback);
    } catch { return binaryRequestErrorMessage(err, fallback); }
  }
  return getErrorMessage(err, fallback);
}

function decodeJsonMessage(value) {
  if (!value) return '';
  if (typeof value === 'object' && typeof value.message === 'string') return value.message;
  let text;
  if (Object.prototype.toString.call(value) === '[object ArrayBuffer]') text = new TextDecoder().decode(new Uint8Array(value));
  else if (ArrayBuffer.isView(value)) text = new TextDecoder().decode(value);
  else if (typeof value === 'string') text = value;
  else return '';
  try {
    const parsed = JSON.parse(text);
    return typeof parsed.message === 'string' ? parsed.message : '';
  } catch {
    return '';
  }
}

function binaryRequestErrorMessage(err, fallback) {
  return decodeJsonMessage(err?.response?.data) || (err?.response ? fallback : getErrorMessage(err, fallback));
}

/** Extracts API errors returned as JSON despite binary PDF response mode. */
export async function getBufferErrorMessage(err, fallback = 'Could not render the preview.') {
  const data = err?.response?.data;
  if (data && (typeof data.arrayBuffer === 'function' || typeof data.text === 'function') && typeof data.size === 'number') {
    try {
      const content = typeof data.text === 'function' ? await data.text() : await data.arrayBuffer();
      return decodeJsonMessage(content) || binaryRequestErrorMessage(err, fallback);
    } catch { return binaryRequestErrorMessage(err, fallback); }
  }
  return binaryRequestErrorMessage(err, fallback);
}
