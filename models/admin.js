const mongoose = require("../config/database");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, lowercase: true },
    password: { type: String },
    register_date: {type: String},
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
