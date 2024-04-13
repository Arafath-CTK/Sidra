const Razorpay = require("razorpay");
require("dotenv").config();

// Initialize Razorpay with your API Key and API Secret
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

module.exports = razorpay;
