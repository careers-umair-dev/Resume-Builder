import { describe, expect, it } from 'vitest';
import { getBufferErrorMessage, getBlobErrorMessage } from './errors';

const jsonBuffer = (value) => new TextEncoder().encode(JSON.stringify(value)).buffer;

describe('binary response error messages', () => {
  it('extracts API messages from arraybuffer and typed-array response bodies', async () => {
    const expected = 'Resume preview payload is too large';
    expect(await getBufferErrorMessage({ response: { data: jsonBuffer({ message: expected }) } })).toBe(expected);
    const bytes = new TextEncoder().encode(JSON.stringify({ message: expected }));
    expect(await getBufferErrorMessage({ response: { data: bytes.subarray(0) } })).toBe(expected);
  });

  it('extracts API messages from blob responses and uses a safe fallback for non-JSON bodies', async () => {
    const expected = 'Image must be 5 MB or smaller';
    const blobPayload = { size: 1, text: async () => JSON.stringify({ message: expected }) };
    expect(await getBlobErrorMessage({ response: { data: blobPayload } })).toBe(expected);
    expect(await getBufferErrorMessage({ response: { status: 500, data: new TextEncoder().encode('<html>proxy error</html>').buffer } })).toBe('Could not render the preview.');
  });
});
