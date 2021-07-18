const Users = require("../models/users");
const SellerProfiles = require("../models/sellerProfiles");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const sendEmailOtp = require("../email/sendEmailOtp");
const { EMAIL_VERIFICATION } = require("../email/otp.types");
require("dotenv").config();

exports.signUp = async (req, res) => {
  try {
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({
        errors: [
          {
            error: "Email already registered",
            param: "email",
          },
        ],
      });
    } else if (existingUser && !existingUser.emailVerified) {
      await Users.deleteOne({ email: req.body.email }, (error) => {
        if (error) {
          console.log("Error deleting existing user while signup", error);
        }
      });
    }

    const user = new Users(req.body);
    user.save((error, user) => {
      if (error) {
        return res.status(400).json({
          error: "Not able to save user to DB",
        });
      }

      sendEmailOtp(EMAIL_VERIFICATION, user.email);

      res.json({
        email: user.email,
        roles: user.roles,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.signIn = (req, res) => {
  const { email, password } = req.body;

  Users.findOne({ email, emailVerified: true }, (error, user) => {
    if (error || !user) {
      if (error) {
        console.log("Error finding user while signin", error);
      }
      return res.status(400).json({
        errors: [
          {
            error: "Email does not exists",
            param: "email",
          },
        ],
      });
    }

    if (!user.authenticate(password)) {
      return res.status(400).json({
        errors: [
          {
            error: "Incorrect password",
            param: "password",
          },
        ],
      });
    }

    let day = new Date();
    day.setDate(day.getDay() + 30);
    const cookieOptions = {
      path: "/",
      expires: day,
      sameSite: "none",
      secure: true,
    };
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token, cookieOptions);
    return res.json({ token, email: user.email, roles: user.roles });
  });
};

exports.signOut = (req, res) => {
  res.clearCookie("token");
  res.json({
    msg: "Signed out",
  });
};

// Protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
  getToken: (req) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      req.cookies.token;
    }
  },
});

exports.getAuth = expressJwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false,
  algorithms: ["HS256"],
  userProperty: "auth",
  getToken: (req) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      req.cookies.token;
    }
  },
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
  const query = Users.findOne({ _id: req.auth._id }).select({
    _id: 0,
    roles: 1,
  });
  query.exec((error, user) => {
    if (error || !user || !user.roles.includes("admin")) {
      return res.status(403).json({
        error: "You are not admin",
      });
    }
    next();
  });
};

exports.isSeller = (req, res, next) => {
  const query = SellerProfiles.findOne({ userId: req.auth._id }).select({
    _id: 1,
  });
  query.exec((error, sellerProfile) => {
    if (error || !sellerProfile) {
      return res.status(403).json({
        error: "You are not a seller",
      });
    }
    req.auth.sellerId = sellerProfile._id;
    next();
  });
};

exports.getSellerAuth = async (req, res, next) => {
  if (!req.auth?._id) {
    next();
  } else {
    try {
      const sellerProfile = await SellerProfiles.findOne({
        userId: req.auth._id,
      })
        .select({
          _id: 1,
        })
        .exec();
      req.auth.sellerId = sellerProfile._id;
      next();
    } catch (error) {
      console.log("Error finding sellerId in getSellerAuth ", error);
      res.status(500).json({ error: "Some error occurred" });
    }
  }
};
