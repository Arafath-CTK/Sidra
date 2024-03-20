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
        address_type: String,
        phone_number: String,
      },
    ],
    // wishlist: { type: Array },
    // cart: [
    //   {
    //     product_id: String,
    //     quantity: Number,
    //     price: Number,
    //     total_price: Number,
    //   },
    // ],
    // orders: [
    //   {
    //     order_id: String,
    //     products: [
    //       {
    //         product_id: String,
    //         quantity: Number,
    //         price: Number,
    //         total_price: Number,
    //       },
    //     ],
    //     total_amount: Number,
    //     status: String,
    //     invoice_details: {
    //       invoice_number: String,
    //       billing_address: {
    //         property_name: String,
    //         street: String,
    //         city: String,
    //         state: String,
    //         pin_code: String,
    //       },
    //     },
    //     payment_status: String,
    //     created_at: Date,
    //   },
    // ],
  },
  { versionKey: false }
);

const user = mongoose.model("user", userSchema, "user");
module.exports = user;
