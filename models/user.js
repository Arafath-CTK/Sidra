const mongoose = require("../config/database");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, lowercase: true, required: true },
    phone_number: { type: String, required: true },
    password: { type: String, required: true },
    // addresses: [
    //   {
    //     name: String,
    //     phone_number: String,
    //     pin_code: String,
    //     property_name: String,
    //     street: String,
    //     city: String,
    //     state: String,
    //     type: String,
    //     primary: Boolean,
    //   },
    // ],
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
