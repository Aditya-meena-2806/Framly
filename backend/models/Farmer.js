const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    location: String,
    approved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Farmer", farmerSchema);
