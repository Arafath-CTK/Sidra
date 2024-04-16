const mongoose = require("../config/database");

const productSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    price: { type: Number },
    category: { type: String },
    sub_category: { type: String },
    stock: { type: Number },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

const product = mongoose.model("product", productSchema, "product");
module.exports = product;
