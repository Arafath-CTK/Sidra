const mongoose = require("../config/database");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, required: true },
    password: { type: String, required: true },
    banners: [
      {
        image: String,
        link: String,
        position: String,
      },
    ],
    coupons: [
      {
        code: String,
        discount: String,
        expiry: Date,
        min_order_amount: Number,
      }, 
    ],
    blogs: [
      {
        title: String,
        content: String,
        created_at: Date,
      },
    ],
  },
  { versionKey: false }
);

const admin = mongoose.model("admin", adminSchema, "admin");
module.exports = admin;
