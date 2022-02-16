const otpGenerator = require("otp-generator");
const EmailOtp = require("../models/emailOtps");
const sendEmail = require("./sendEmail");
const { EMAIL_VERIFICATION, PASSWORD_RESET } = require("../email/otp.types");
const {
  emailVerificationEmailTemplate,
  passwordResetEmailTemplate,
} = require("./emailTemplates");

const sendEmailOtp = (type, email) => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const emailOtp = new EmailOtp({ type, email, otp });
  emailOtp.save((error) => {
    if (error) {
      console.log("Error saving email verification otp in model");
    }
  });

  let subject = "";
  let html = "";
  if (type == EMAIL_VERIFICATION) {
    html = emailVerificationEmailTemplate(otp);
    subject = "Email Verification OTP";
  } else if (type == PASSWORD_RESET) {
    html = passwordResetEmailTemplate(otp);
    subject = "Password Reset OTP";
  }
  sendEmail(subject, html, email);
};

module.exports = sendEmailOtp;
