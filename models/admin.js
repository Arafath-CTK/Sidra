const mongoose = require("../config/database");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, lowercase: true },
    password: { type: String },
    register_date: { type: String },
    banner: {
      mainBanner: {
        type: Array,
        required: true,
      },
      categoryBanner: [
        {
          image: {
            type: String,
          },
        },
        {
          image: {
            type: String,
          },
        },
      ],
    },
    coupons: [
      {
        code: { type: String, unique: true, uppercase: true },
        coupon_type: String,
        discount: Number,
        start_date: Date,
        end_date: Date,
        isActive: Boolean,
        max_usage: Number,
        min_cart_value: Number,
      },
    ],
  },
  { versionKey: false }
);

const admin = mongoose.model("admin", adminSchema, "admin");
module.exports = admin;
