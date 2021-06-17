const { EMAIL_VERIFICATION, PASSWORD_RESET } = require("../email/otp.types");
const EmailOtp = require("../models/emailOtps");
const User = require("../models/users");
const sendEmailOtp = require("../email/sendEmailOtp");
const { v1: uuidv1 } = require("uuid");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const sendEmail = require("../email/sendEmail");
const {
  welcomeEmailTemplate,
  passwordResetSuccessfulEmailTemplate,
} = require("../email/emailTemplates");

exports.verifyEmail = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      errorParam: errors.array()[0].param,
    });
  }

  const { email, otp } = req.body;

  const updatedEmailOtp = await EmailOtp.updateMany(
    { email, type: EMAIL_VERIFICATION, count: { $lt: 5 } },
    { $inc: { count: 1 } }
  ).exec();

  if (updatedEmailOtp?.nModified === 0) {
    return res.status(550).json({
      error: "OTP verification limit exceeded, try generating new otp",
    });
  }

  EmailOtp.findOne(
    { email, otp, type: EMAIL_VERIFICATION },
    (error, emailOtp) => {
      if (error) {
        return res.status(500).json({
          error: "Some error occurred",
        });
      } else if (!emailOtp) {
        return res.status(404).json({
          error: "OTP entered is wrong / expired",
        });
      } else {
        User.updateOne(
          { email },
          { $set: { emailVerified: true } },
          (error) => {
            if (error) {
              console.log(
                "Error occurred while updating user to email verified",
                error
              );
            }
          }
        );

        sendEmail("Welcome to Bookshlf", welcomeEmailTemplate(), email);

        return res.json({
          message: "Email verified successfully",
        });
      }
    }
  );
};

exports.sendVerifyEmailOtp = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      errorParam: errors.array()[0].param,
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email, emailVerified: true }, (error) => {
    if (error) {
      console.log("Error finding user in verifyEmail", error);
    }
  });

  if (user) {
    return res.status(400).json({
      error: "Email already verified",
    });
  }

  sendEmailOtp(EMAIL_VERIFICATION, email);

  return res.json({
    message: "OTP send successfully",
  });
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      errorParam: errors.array()[0].param,
    });
  }

  const { email, otp, password } = req.body;

  const updatedEmailOtp = await EmailOtp.updateMany(
    { email, type: PASSWORD_RESET, count: { $lt: 5 } },
    { $inc: { count: 1 } }
  ).exec();

  if (updatedEmailOtp?.nModified === 0) {
    return res.status(550).json({
      error: "OTP verification limit exceeded, try generating new otp",
    });
  }

  EmailOtp.findOne({ email, otp, type: PASSWORD_RESET }, (error, emailOtp) => {
    if (error) {
      return res.status(500).json({
        error: "Some error occurred",
      });
    } else if (!emailOtp) {
      return res.status(404).json({
        error: "OTP entered is wrong / expired",
      });
    } else {
      const salt = uuidv1();
      const encryPassword = crypto
        .createHmac("sha256", salt)
        .update(password)
        .digest("hex");

      User.updateOne({ email }, { salt, encryPassword }, (error) => {
        if (error) {
          console.log("Error occurred while changing user password", error);
        }
      });

      EmailOtp.deleteMany({ email, type: PASSWORD_RESET }, (error) => {
        if (error)
          console.log("Error deleting otp after password reset", error);
      });

      sendEmail(
        "Password Changed",
        passwordResetSuccessfulEmailTemplate(),
        email
      );

      return res.json({
        message: "Password changed successfully",
      });
    }
  });
};

exports.sendResetPasswordOtp = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      errorParam: errors.array()[0].param,
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email, emailVerified: true }, (error) => {
    if (error) {
      console.log("Error finding user in sendResetPasswordOtp", error);
    }
  });

  if (!user) {
    return res.status(400).json({
      error: "No account found",
    });
  }

  sendEmailOtp(PASSWORD_RESET, email);

  return res.json({
    message: "OTP send successfully",
  });
};
