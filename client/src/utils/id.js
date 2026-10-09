/** 24-hex id, valid as a MongoDB ObjectId, so client-created entries keep the same id after saving. */
export const objectId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
