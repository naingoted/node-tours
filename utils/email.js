const nodemailer = require('nodemailer');


const sendEmail = async options => {

// 1) config email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

// 2) define the email options
const mailOptions = {
    from: 'Thet Naing Oo <hello@vince.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };


// 3) send email
await transporter.sendMail(mailOptions);
    
}

module.exports = sendEmail;