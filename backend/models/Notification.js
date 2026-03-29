const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["OUT_OF_STOCK", "INFO"], default: "OUT_OF_STOCK" },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
