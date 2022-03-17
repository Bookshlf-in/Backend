require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async (req, res) => {
  try {
    const { type, emailData } = req.body;
    if (type == "DEFAULT") {
      await sgMail.send(emailData);
    } else if (type == "SEND_MULTIPLE") {
      await sgMail.sendMultiple(emailData);
    }
    res.json({ msg: "Email send successfully" });
  } catch (error) {
    console.log("Error in /admin-sendEmail ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
