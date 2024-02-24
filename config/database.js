const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error", err));

module.exports = mongoose;
