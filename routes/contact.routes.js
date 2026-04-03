const express = require("express");
const router = express.Router();

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const Contact = require("../models/Contact");
const transporter = require("../config/mailer");

router.post("/", async (req, res) => {
  try {
    console.log("EMAIL_USER:" , process.env.EMAIL_USER);
    console.log("EMAIL_HOST:" , process.env.EMAIL_HOST);
    console.log("ADMIN_EMAIL:" , process.env.ADMIN_EMAIL);

    const { name, email, message } = req.body;

    // const submittedAt = dayjs().format("DD MMM YYYY, hh:mm A");

    const submittedAt = dayjs()
    .tz("asia/kolkata")
    .format("DD MMM YYYY, hh:mm A");

    // Save to DB
    await Contact.create({ name, email, message, submittedAt });

    /* ADMIN EMAIL */
    await transporter.sendMail({
      from: `"Prime Care Website" <${process.env.EMAIL_USER}>`,
      to: "primecaretransportations98@gmail.com",
      subject: "New Contact Form Submission",
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
        <p><b>Submitted At:</b> ${submittedAt}</p>
      `,
    });

    /* CUSTOMER AUTO REPLY */
    await transporter.sendMail({
      from: `"Prime Care Medical Transportation" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for contacting <b>Prime Care Medical Transportation</b>.</p>
        <p>We have received your message and will contact you shortly.</p>
        <br/>
        <p>Best Regards,<br/>Prime Care Team</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
