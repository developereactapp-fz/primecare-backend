const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,          // e.g., smtp.gmail.com or your domain SMTP
  port: Number(process.env.EMAIL_PORT),  // 587 for TLS, 465 for SSL
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,        // your verified email
    pass: process.env.EMAIL_PASS,        // app password if Gmail
  },
  tls: {
    rejectUnauthorized: false,           // helps prevent self-signed issues
  },
  // Optional but increases inbox trust
  from: `"Prime Care Website" <${process.env.EMAIL_USER}>`,
});

transporter.verify((err, success) => {
  if (err) {
    console.error("Mailer Error:", err);
  } else {
    console.log("Mailer is ready to send messages");
  }
});

module.exports = transporter;