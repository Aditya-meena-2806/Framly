const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    approved: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Farmer", farmerSchema);
