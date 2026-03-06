const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String, required: true }, // Fruit or Vegetable
    image: { type: String }, // Path to uploaded image
    isApproved: { type: Boolean, default: false },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
