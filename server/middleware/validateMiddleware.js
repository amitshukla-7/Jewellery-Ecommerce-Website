export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
};
