require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getDestinationEmail = (to) => {
  switch (to.split("@")[0]) {
    case "rohit":
      return "rk57382@gmail.com";
    case "abhishek":
      return "abhishekworks787@gmail.com";
    case "aman":
      return "vaman5629@gmail.com";
    case "ritu.kumari":
      return "Kritu1113@gmail.com";
    case "ashutosh.singh":
      return "ashutoshsingh202003@gmail.com";
    default:
      return process.env.ADMIN_EMAIL;
  }
};

exports.sgInboundParse = async (req, res) => {
  try {
    const email = req.body;
    const destinationEmail = getDestinationEmail(
      JSON.parse(email.envelope).to[0]
    );
    await sgMail.send({
      personalizations: [
        {
          subject: email.subject,
          to: [
            {
              name: JSON.parse(email.envelope).to[0],
              email: destinationEmail,
            },
          ],
        },
      ],
      from: {
        email: "forward@bookshlf.in",
        name: email.from,
      },
      reply_to: {
        email: JSON.parse(email.envelope).from,
      },
      content: [
        {
          type: "text/html",
          value: email.html || email.text,
        },
      ],
    });
    res.status(200).send();
  } catch (error) {
    console.log("Error in /sgInboundParse ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
