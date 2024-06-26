const mongoose = require("../config/database");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, lowercase: true },
    phone_number: { type: String },
    password: { type: String },
    register_date: { type: String },
    status: { type: String, enum: ["Active", "Blocked"], default: "Active" },
    addresses: [
      {
        name: String,
        house_name: String,
        street: String,
        city: String,
        state: String,
        pin_code: String,
        address_type: {
          type: String,
          default: "Home",
        },
        phone_number: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: Number,
        isSelected: Boolean,
      },
    ],
    orders: [
      {
        name: String,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        quantity: Number,
        price: Number,
        total_price: Number, 
        address: {
          name: String,
          house_name: String,
          street: String,
          city: String,
          state: String,
          pin_code: String,
        },
        payment_status: String,
        status: String,
        reason: {
          type: String,
          default: "NA",
        },
        created_at: Date,
      },
    ],
    usedCoupons: [String],
  },
  { versionKey: false }
);

const user = mongoose.model("user", userSchema, "user");
module.exports = user;
