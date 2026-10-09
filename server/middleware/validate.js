/** validate(schema, 'body' | 'query') — replaces the source with parsed, stripped data. */
module.exports = (schema, source = 'body') => (req, _res, next) => {
  try {
    const parsed = schema.parse(req[source]);
    if (source === 'query') req.validatedQuery = parsed;
    else req[source] = parsed;
    next();
  } catch (err) {
    next(err);
  }
};
