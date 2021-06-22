const { validationResult } = require("express-validator");

exports.handleValidationError = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
      errorParam: errors.array()[0].param,
    });
  }
  next();
};
