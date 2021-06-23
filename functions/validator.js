const { validationResult } = require("express-validator");

exports.handleValidationError = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const arr = errors.errors.map((e) => ({ error: e.msg, param: e.param }));
    return res.status(400).json({
      errors: arr,
    });
  }
  next();
};
