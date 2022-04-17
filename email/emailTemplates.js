exports.welcomeEmailTemplate = () => `
<div style="font-family: Helvetica,Arial,sans-serif;min-width:200px;overflow:auto;line-height:2">
<div style="margin:20px auto;width:70%;padding:20px 0">
<div style="border-bottom:1px solid #eee">
  <a href="https://bookshlf.in/"><img src="https://storage.googleapis.com/bookshlf-in/static/logo/logoView.png" width="200px"/></a>
</div>
<p style="font-size:1.1em">Hi,</p>
<p>Welcome to Bookshlf</p>
<p>We are Happy to have you as our customer. Now You can buy and Sell used Books.</p>
<p>Continue shopping at <a href="https://bookshlf.in">https://bookshlf.in</a></p>
<p style="font-size:0.9em;">Regards,<br />Team Bookshlf</p>
<hr style="border:none;border-top:1px solid #eee" />
<div style="text-align:center;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
  <p>All rights reserved &copy;2022</p>
  <p>Bookshlf</p>
  <p>contact us at <a href="mailto:bookshlf.in@gmail.com" style="color: #aaa">bookshlf.in@gmail.com</a>
  </p>
</div>
</div>
</div>
`;

exports.emailVerificationEmailTemplate = (otp) => `
<div>
<div>
<p style="font-size:1.1em">Hi,</p>
<p>Use the following OTP to verify your email. OTP is valid for 5 minutes</p>
<h2><strong>${otp}</strong></h2>
<p style="font-size:0.9em;">Regards<br />Team Bookshlf</p>
</div>
</div>
`;

exports.passwordResetEmailTemplate = (otp) => `
<div>
<div>
<p style="font-size:1.1em">Hi,</p>
<p>Use the following OTP to Reset your password. OTP is valid for 5 minutes</p>
<h2><strong>${otp}</strong></h2>
<p style="font-size:0.9em;">Regards<br />Team Bookshlf</p>
</div>
</div>
`;

exports.passwordResetSuccessfulEmailTemplate = () => `
<div style="font-family: Helvetica,Arial,sans-serif;min-width:200px;overflow:auto;line-height:2">
<div style="margin:20px auto;width:70%;padding:20px 0">
<div style="border-bottom:1px solid #eee">
  <a href="https://bookshlf.in/"><img src="https://storage.googleapis.com/bookshlf-in/static/logo/logoView.png" width="200px"/></a>
</div>
<p style="font-size:1.1em">Hi,</p>
<p>Password changed successfully.</p>
<p>Continue shopping at <a href="https://bookshlf.in">https://bookshlf.in</a></p>
<p style="font-size:0.9em;">Regards,<br />Team Bookshlf</p>
<hr style="border:none;border-top:1px solid #eee" />
<div style="text-align:center;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
  <p>All rights reserved &copy;2022</p>
  <p>Bookshlf</p>
  <p>contact us at <a href="mailto:bookshlf.in@gmail.com" style="color: #aaa">bookshlf.in@gmail.com</a>
  </p>
</div>
</div>
</div>
`;
