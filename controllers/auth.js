const User = require("../models/users");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const sendEmailOtp = require("../email/sendEmailOtp");
const { EMAIL_VERIFICATION } = require("../email/otp.types");

exports.signUp = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.array()[0].msg,
        errorParam: errors.array()[0].param,
      });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({
        error: "Email already registered",
      });
    } else if (existingUser && !existingUser.emailVerified) {
      await User.deleteOne({ email: req.body.email }, (error) => {
        if (error) {
          console.log("Error deleting existing user while signup", error);
        }
      });
    }

    const user = new User(req.body);
    user.save((error, user) => {
      if (error) {
        return res.status(400).json({
          error: "Not able to save user to DB",
        });
      }

      sendEmailOtp(EMAIL_VERIFICATION, user.email);

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.signIn = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      errorParam: errors.array()[0].param,
    });
  }

  User.findOne({ email, emailVerified: true }, (error, user) => {
    if (error || !user) {
      if (error) {
        console.log("Error finding user while signin", error);
      }
      return res.status(400).json({
        error: "Email does not exists",
      });
    }

    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email / Password incorrect",
      });
    }

    // Create token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // Put token in cookie
    res.cookie("token", token, { expiresIn: "60d" });

    // Send response to front end
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

exports.signOut = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signed out successfully",
  });
};

// Protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

// Custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id === req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "Access denied",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Access denied, You are not ADMIN",
    });
  }
  next();
};
