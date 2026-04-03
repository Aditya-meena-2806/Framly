const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner", default: null },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Pending" }, // Pending, Accepted, Picked Up, Shipped, Delivered, Cancelled
    address: { type: String },
    phone: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    deliveredAt: { type: Date, default: null },
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, default: "" },
        reviewedAt: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
