const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
    role: { type: String, required: true, enum: ['customer', 'farmer', 'delivery_partner'] },
    otp: { type: String, required: true },
    email: { type: String, required: true },
    userData: { type: Object, required: true }, // Stores whatever registration data was sent
    createdAt: { type: Date, default: Date.now, index: { expires: '10m' } } // Auto-delete after 10 minutes
});

module.exports = mongoose.model("PendingUser", pendingUserSchema);
