const express = require("express");
const router = express.Router();

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");

// ================================
// TRANSPORTER CONFIG (OPTIMIZED)
// ================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,          // e.g., smtp.gmail.com or your domain SMTP
  port: Number(process.env.EMAIL_PORT),  // 587 for TLS, 465 for SSL
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,        // verified email
    pass: process.env.EMAIL_PASS,        // app password if Gmail
  },
  tls: {
    rejectUnauthorized: false,
  },
  from: `"Prime Care Website" <${process.env.EMAIL_USER}>`,
});

// Verify transporter connection
transporter.verify((err, success) => {
  if (err) console.error("Mailer Error:", err);
  else console.log("Mailer ready to send messages");
});

// ================================
// BOOKING POST ROUTE
// ================================
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      pickupDateTime,
      pickupLocation,
      dropLocation,
      serviceType,
      notes,
    } = req.body;

    // -----------------------------
    // SERVER VALIDATION
    // -----------------------------
    if (!name || !email || !phone || !pickupDateTime || !pickupLocation || !dropLocation || !serviceType) {
      return res.json({ success: false, message: "All required fields must be filled" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.json({ success: false, message: "Invalid email format" });

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) return res.json({ success: false, message: "Invalid phone number" });

    // -----------------------------
    // FORMAT DATE
    // -----------------------------
    const date = dayjs(pickupDateTime);
    const pickupDate = date.format("DD MMM YYYY");
    const pickupTime = date.format("hh:mm A");
    const submittedAt = dayjs().tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A");

    // -----------------------------
    // SAVE TO DATABASE
    // -----------------------------
    await Booking.create({
      name,
      email,
      phone,
      pickupDate,
      pickupTime,
      pickupLocation,
      dropLocation,
      serviceType,
      notes,
      submittedAt,
    });

    // -----------------------------
    // ADMIN EMAIL
    // -----------------------------
    await transporter.sendMail({
      from: `"Prime Care Website" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email, // important for reply
      subject: `New Booking from ${name}`, // humanized subject

      text: `
New Booking Request

Name: ${name}
Email: ${email}
Phone: ${phone}
Service: ${serviceType}
Pickup Date: ${pickupDate}
Pickup Time: ${pickupTime}
Pickup Location: ${pickupLocation}
Drop Location: ${dropLocation}
Notes: ${notes || "-"}

Submitted At: ${submittedAt}
      `,

      html: `
<h3>New Booking Request</h3>
<p>This is a new booking submitted from your website.</p>
<hr/>
<p><b>Name:</b> ${name}</p>
<p><b>Email:</b> ${email}</p>
<p><b>Phone:</b> ${phone}</p>
<p><b>Service:</b> ${serviceType}</p>
<p><b>Pickup Date:</b> ${pickupDate}</p>
<p><b>Pickup Time:</b> ${pickupTime}</p>
<p><b>Pickup Location:</b> ${pickupLocation}</p>
<p><b>Drop Location:</b> ${dropLocation}</p>
<p><b>Notes:</b> ${notes || "-"}</p>
<hr/>
<p><b>Submitted At:</b> ${submittedAt}</p>
      `,
    });

    // -----------------------------
    // CUSTOMER CONFIRMATION EMAIL
    // -----------------------------
    await transporter.sendMail({
      from: `"Prime Care Medical Transportation" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Booking Request Received",

      text: `
Hi ${name},

Your booking request has been received successfully.

Pickup: ${pickupLocation}
Drop: ${dropLocation}
Date: ${pickupDate}
Time: ${pickupTime}

Our team will contact you shortly.

Thank you,
Prime Care Team
      `,

      html: `
<h2>Booking Confirmation</h2>
<p>Hi ${name},</p>
<p>Your booking request has been submitted successfully.</p>
<hr/>
<p><b>Pickup:</b> ${pickupLocation}</p>
<p><b>Drop:</b> ${dropLocation}</p>
<p><b>Date:</b> ${pickupDate}</p>
<p><b>Time:</b> ${pickupTime}</p>
<hr/>
<p>Our team will contact you shortly.</p>
<br/>
<p>Thank you,<br/>Prime Care Team</p>
      `,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;