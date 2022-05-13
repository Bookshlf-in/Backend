require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getDestinationEmail = (from) => {
  switch (from.split("@")[0]) {
    case "rohit":
      return "rk57382@gmail.com";
    case "abhishek":
      return "abhishekworks787@gmail.com";
    case "aman":
      return "amanverma160400@gmail.com";
    default:
      return "bookshlf.in@gmail.com";
  }
};

exports.sgInboundParse = async (req, res) => {
  try {
    const email = req.body;
    const destinationEmail = getDestinationEmail(req.body.envelope.from);
    const newEmail = {
      personalizations: [
        {
          subject: email.subject,
          to: [
            {
              email: destinationEmail,
            },
          ],
        },
      ],
      from: {
        email: "inbound@bookshlf.in",
        name: email.from,
      },
      reply_to: {
        email: email.envelope.from,
      },
      content: [
        {
          type: "text/html",
          value: email.text,
        },
      ],
    };
    sgMail.send(newEmail);
    res.json({ msg: "Email send successfully" });
  } catch (error) {
    console.log("Error in /sgInboundParse ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
