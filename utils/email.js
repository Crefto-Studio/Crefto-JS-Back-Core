const nodemailer = require('nodemailer');

// // we use that class in that form: new Email(user, url).sendWelcome();
// module.exports = class Email {
//   constructor(user, url) {
//     this.to = user.email;
//     this.firstName = user.name.split(' ')[0]; // take the first element in the resulting array(first name only)
//     this.url = url;
//     this.from = `Maryam Adel <${process.env.EMAIL_FROM}>`;
//   }

//   newTransport() {
//     // In production we want to send real emails so we will use Sendgrid
//     if (process.env.NODE_ENV === 'production') {
//       // Sendgrid
//       return 1;
//     }
// In development instead of the email going to a real email address it will get caught into our email inbox
//     // retun a new nodemailer transport
//     return nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD
//       }
//     });
//   }

//   // Send the actual email
//   async send(subject) {
//     // 1)Define email options
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject
//     };

//     // 2)Create the transport and send the email
//     await this.newTransport().sendMail(mailOptions);
//   }

//   async sendWelcome() {
//     await this.send('Welcome to the Marketplace Family');
//   }

//   async sendPasswordReset() {
//     await this.send('Your password reset token (valid for only 10 minutes)');
//   }
// };

// ================================================================
// first method
// ================================================================

const sendEmail = async options => {
  let transporter;
  // In production we want to send real emails so we will use Sendgrid
  if (process.env.NODE_ENV === 'production') {
    // Sendgrid
    transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    // return 1;
  } else {
    // In development instead of the email going to a real email address it will get caught into our email inbox
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // 2) Define the email options
  const mailOptions = {
    from: `Crefto Accounts <${process.env.EMAIL_FROM}`,
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

// ==========================================================================================

// const sendEmail = async options => {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD
//       }
//     });
//   }

//   // 2) Define the email options
//   const mailOptions = {
//     from: `Maryam Adel <${process.env.EMAIL_FROM}`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//     // html:
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
