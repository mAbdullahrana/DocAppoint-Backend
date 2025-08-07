const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
  // 1) create a transporter

  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST, // sandbox.smtp.mailtrap.io
    port: process.env.EMAIL_PORT, // ya 587
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "MedAppoint <abdullah@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 2) send the email
  await transporter.sendMail(mailOptions);
};
