// config/mailer.js
const nodemailer = require("nodemailer");

// Create a reusable transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,                 // e.g., smtp.titan.email
  port: Number(process.env.EMAIL_PORT),         // 465 (SSL) or 587 (STARTTLS)
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,               // your domain email
    pass: process.env.EMAIL_PASS,               // email password or app password
  },
  tls: {
    rejectUnauthorized: false                   // prevents TLS errors (optional)
  },
});

// Verify SMTP connection (optional but useful for debugging)
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Config Error:", error);
  } else {
    console.log("✅ SMTP Ready to send emails");
  }
});

// Send a mail function (optional helper)
async function sendMail({ from, to, subject, html, replyTo }) {
  try {
    const info = await transporter.sendMail({
      from: from || `"Prime Care Medical" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      replyTo: replyTo || process.env.ADMIN_EMAIL, // ensures replies go to admin
    });
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email failed:", err);
    throw err;
  }
}

module.exports = { transporter, sendMail };