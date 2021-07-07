const { EMAIL_VERIFICATION, PASSWORD_RESET } = require("../email/otp.types");
const EmailOtp = require("../models/emailOtps");
const Users = require("../models/users");
const sendEmailOtp = require("../email/sendEmailOtp");
const { v1: uuidv1 } = require("uuid");
const crypto = require("crypto");
const sendEmail = require("../email/sendEmail");
const {
  welcomeEmailTemplate,
  passwordResetSuccessfulEmailTemplate,
} = require("../email/emailTemplates");

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await Users.findOne({ email })
    .select({ emailVerified: 1 })
    .exec();
  if (!user) {
    return res.status(400).json({
      errors: [
        {
          error: "Email does not exist",
          param: "email",
        },
      ],
    });
  } else if (user.emailVerified == true) {
    return res.status(400).json({
      errors: [
        {
          error: "Email already verified",
          param: "email",
        },
      ],
    });
  }

  const updatedEmailOtp = await EmailOtp.updateMany(
    { email, type: EMAIL_VERIFICATION, count: { $lt: 5 } },
    { $inc: { count: 1 } }
  ).exec();

  if (updatedEmailOtp?.nModified === 0) {
    return res.status(550).json({
      error: "Limit exceeded, generate new otp",
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
          errors: [
            {
              error: "OTP entered is wrong / expired",
              param: "otp",
            },
          ],
        });
      } else {
        Users.updateOne(
          { email },
          { $set: { emailVerified: true } },
          (error) => {
            if (error) {
              console.log(
                "Error occurred while updating user to email verified",
                error
              );
              return res.status(500).json({
                error: "Failed to verify email",
              });
            }

            sendEmail("Welcome to Bookshlf", welcomeEmailTemplate(), email);
            return res.json({
              msg: "Email verified",
            });
          }
        );
      }
    }
  );
};

exports.sendVerifyEmailOtp = async (req, res) => {
  const { email } = req.body;

  const user = await Users.findOne({ email, emailVerified: true }, (error) => {
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
    msg: "OTP send",
  });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await Users.findOne({ email }).select({ _id: 1 }).exec();
  if (!user) {
    return res.status(400).json({
      errors: [
        {
          error: "Email does not exist",
          param: "email",
        },
      ],
    });
  }

  const updatedEmailOtp = await EmailOtp.updateMany(
    { email, type: PASSWORD_RESET, count: { $lt: 5 } },
    { $inc: { count: 1 } }
  ).exec();

  if (updatedEmailOtp?.nModified === 0) {
    return res.status(550).json({
      errors: [
        {
          error: "Limit exceeded, generate new otp",
          param: "otp",
        },
      ],
    });
  }

  EmailOtp.findOne({ email, otp, type: PASSWORD_RESET }, (error, emailOtp) => {
    if (error) {
      return res.status(500).json({
        error: "Some error occurred",
      });
    } else if (!emailOtp) {
      return res.status(404).json({
        errors: [
          {
            error: "OTP entered is wrong / expired",
            param: "otp",
          },
        ],
      });
    } else {
      const salt = uuidv1();
      const encryPassword = crypto
        .createHmac("sha256", salt)
        .update(password)
        .digest("hex");

      Users.updateOne({ email }, { salt, encryPassword }, (error) => {
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
        msg: "Password changed",
      });
    }
  });
};

exports.sendResetPasswordOtp = async (req, res) => {
  const { email } = req.body;

  const user = await Users.findOne({ email, emailVerified: true }, (error) => {
    if (error) {
      console.log("Error finding user in sendResetPasswordOtp", error);
    }
  });

  if (!user) {
    return res.status(400).json({
      error: "Account not found",
    });
  }

  sendEmailOtp(PASSWORD_RESET, email);

  return res.json({
    msg: "OTP send",
  });
};

exports.getUserProfile = (req, res) => {
  const query = Users.findOne({ _id: req.auth._id }).select({
    _id: 0,
    name: 1,
    roles: 1,
    email: 1,
    createdAt: 1,
  });
  query.exec((error, user) => {
    if (error) {
      console.log("Error finding user in getUserProfile", error);
      return res.status(500).json({ error: "Some error occurred" });
    }
    res.json(user);
  });
};
