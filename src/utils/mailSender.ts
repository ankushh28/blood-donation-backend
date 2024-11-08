const nodemailer = require('nodemailer');

export const mailSender = async (email: string, title: string, body: string) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    });
    let info = await transporter.sendMail({
      from: 'ankushchoudhary22000@gmail.com DonorLink',
      to: email,
      subject: title,
      html: body,
    });
    console.log("Email info: ", info);
    return info;
  } catch (error: any) {
    console.log(error.message);
  }
};