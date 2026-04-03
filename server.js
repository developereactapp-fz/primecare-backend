const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const contactRoutes = require("./routes/contact.routes");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

/* --------------------------
   CORS CONFIGURATION
--------------------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "https://primecare-front.vercel.app",
  "https://www.primecaretransportations.com",
  "https://primecaretransportations.com"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

/* --------------------------
   ROUTES
--------------------------- */
app.use("/api/contact", contactRoutes);
app.use("/api/booking", bookingRoutes);

/* --------------------------
   MONGODB CONNECTION
--------------------------- */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

/* --------------------------
   LOCAL DEVELOPMENT
--------------------------- */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
}

module.exports = app;
