const express = require("express");
const router = express.Router();

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const Booking = require("../models/Booking");
const transporter = require("../config/mailer");

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email, // ✅ ADDED
      phone,
      pickupDateTime,
      pickupLocation,
      dropLocation,
      serviceType,
      notes,
    } = req.body;

    /* =========================
       SERVER VALIDATION
    ========================== */

    if (!name || !email || !phone || !pickupDateTime || !pickupLocation || !dropLocation || !serviceType) {
      return res.json({ success: false, message: "All required fields must be filled" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.json({ success: false, message: "Invalid phone number" });
    }

    /* =========================
       FORMAT DATE
    ========================== */

    const date = dayjs(pickupDateTime);
    const pickupDate = date.format("DD MMM YYYY");
    const pickupTime = date.format("hh:mm A");
    // const submittedAt = dayjs().format("DD MMM YYYY, hh:mm A");
    const submittedAt = dayjs()
    .tz("asia/kolkata")
    .format("DD MMM YYYY, hh:mm A");

    /* =========================
       SAVE TO DATABASE
    ========================== */

    await Booking.create({
      name,
      email, // ✅ SAVED
      phone,
      pickupDate,
      pickupTime,
      pickupLocation,
      dropLocation,
      serviceType,
      notes,
      submittedAt,
    });

    /* =========================
       ADMIN EMAIL
    ========================== */

    await transporter.sendMail({
      from: `"Prime Care Website" <${process.env.EMAIL_USER}>`,
      replyTo: "dispatch@primecaretransportations.com",
      subject: "New Booking Request",
      html: `
        <h3>New Booking Request</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Service:</b> ${serviceType}</p>
        <p><b>Pickup Date:</b> ${pickupDate}</p>
        <p><b>Pickup Time:</b> ${pickupTime}</p>
        <p><b>Pickup Location:</b> ${pickupLocation}</p>
        <p><b>Drop Location:</b> ${dropLocation}</p>
        <p><b>Notes:</b> ${notes || "-"}</p>
        <p><b>Submitted At:</b> ${submittedAt}</p>
      `,
    });

    /* =========================
       CUSTOMER CONFIRMATION EMAIL
    ========================== */

    await transporter.sendMail({
      from: `"Prime Care Medical Transportation" <${process.env.EMAIL_USER}>`,
      to: email, // ✅ NOW SENDING TO USER EMAIL
      subject: "Booking Request Received",
      html: `
        <h2>Booking Confirmation</h2>
        <p>Hi ${name},</p>
        <p>Your booking request has been submitted successfully.</p>
        <hr/>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Service:</b> ${serviceType}</p>
        <p><b>Pickup Date:</b> ${pickupDate}</p>
        <p><b>Pickup Time:</b> ${pickupTime}</p>
        <p><b>Pickup Location:</b> ${pickupLocation}</p>
        <p><b>Drop Location:</b> ${dropLocation}</p>
        <hr/>
        <p>Our team will contact you shortly to confirm availability.</p>
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