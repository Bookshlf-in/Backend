const { EMAIL_VERIFICATION, PASSWORD_RESET } = require("../email/otp.types");
const EmailOtp = require("../models/emailOtps");
const Users = require("../models/users");
const AdminPermissions = require("../models/adminPermissions");
const sendEmailOtp = require("../email/sendEmailOtp");
const { v1: uuidv1 } = require("uuid");
const crypto = require("crypto");
const sendEmail = require("../email/sendEmail");
const {
  welcomeEmailTemplate,
  passwordResetSuccessfulEmailTemplate,
} = require("../email/emailTemplates");

exports.verifyEmail = async (req, res) => {
  try {
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
      { email, type: EMAIL_VERIFICATION, count: { $lt: 10 } },
      { $inc: { count: 1 } }
    ).exec();

    if (updatedEmailOtp?.modifiedCount === 0) {
      return res.status(550).json({
        errors: [
          {
            error: "Limit exceeded, generate new otp",
            param: "otp",
          },
        ],
      });
    }

    const emailOtp = await EmailOtp.findOne({
      email,
      otp,
      type: EMAIL_VERIFICATION,
    });

    if (!emailOtp) {
      return res.status(404).json({
        errors: [
          {
            error: "OTP entered is wrong / expired",
            param: "otp",
          },
        ],
      });
    }

    Users.updateOne({ email }, { $set: { emailVerified: true } }, (error) => {
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
    });
  } catch (error) {
    console.log("Error occurred in /verifyEmail ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.sendVerifyEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email }).select({
      emailVerified: 1,
    });

    if (!user) {
      return res.status(400).json({
        error: "Email not found",
      });
    } else if (user.emailVerified) {
      return res.status(400).json({
        error: "Email already verified",
      });
    }

    sendEmailOtp(EMAIL_VERIFICATION, email);

    return res.json({
      msg: "OTP send",
    });
  } catch (error) {
    console.log("Error occurred in /sendVerifyEmailOtp ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
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
      { email, type: PASSWORD_RESET, count: { $lt: 10 } },
      { $inc: { count: 1 } }
    ).exec();

    if (updatedEmailOtp?.modifiedCount === 0) {
      return res.status(550).json({
        errors: [
          {
            error: "Limit exceeded, generate new otp",
            param: "otp",
          },
        ],
      });
    }

    const emailOtp = await EmailOtp.findOne({
      email,
      otp,
      type: PASSWORD_RESET,
    });

    if (!emailOtp) {
      return res.status(404).json({
        errors: [
          {
            error: "OTP entered is wrong / expired",
            param: "otp",
          },
        ],
      });
    }
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
      if (error) console.log("Error deleting otp after password reset", error);
    });

    sendEmail(
      "Password Changed",
      passwordResetSuccessfulEmailTemplate(),
      email
    );

    return res.json({
      msg: "Password changed",
    });
  } catch (error) {
    console.log("Error occurred in /resetPassword ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.sendResetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email, emailVerified: true });

    if (!user) {
      return res.status(400).json({
        error: "Account not found",
      });
    }

    sendEmailOtp(PASSWORD_RESET, email);

    return res.json({
      msg: "OTP send",
    });
  } catch (error) {
    console.log("Error occurred in /sendResetPasswordOtp ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.auth._id })
      .select({
        _id: 1,
        name: 1,
        roles: 1,
        email: 1,
        createdAt: 1,
      })
      .exec();

    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }
    if (user.roles.includes("admin")) {
      const adminPermissions = await AdminPermissions.findOne({
        userId: user._id,
      }).select({ permissions: 1 });
      return res.json({
        ...user._doc,
        adminPermissions: adminPermissions.permissions,
      });
    }
    res.json(user);
  } catch (error) {
    console.log("Error occurred in /getUserProfile ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
