exports.emailToLowerCase = (req, res, next) => {
  if (req?.query?.email) {
    req.query.email = req.query.email.toLowerCase();
  }
  if (req?.body?.email) {
    req.body.email = req.body.email.toLowerCase();
  }
  next();
};
