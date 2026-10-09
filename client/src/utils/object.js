export function setIn(obj, path, value) {
  const [head, ...rest] = path;
  if (!rest.length) return { ...obj, [head]: value };
  return { ...obj, [head]: setIn(obj[head] || {}, rest, value) };
}
