const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const deliveryPartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    active: { type: Boolean, default: true },
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    vehicleType: { type: String }, // Bike, Scooter, Cycle
    status: { type: String, default: "Idle" } // Idle, Active, Off Duty
}, { timestamps: true });

deliveryPartnerSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
