const nodemailer = require("nodemailer");

const config = {
  service: process.env.SERVICES,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};

const transporter = nodemailer.createTransport(config);

const sendMail = async (to,from,subject, body) => {
  await transporter.sendMail({
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: body, // html body
  });
};

module.exports = sendMail;