const express = require("express");
const router = express.Router();
const PendingUser = require("../models/PendingUser");
const User = require("../models/User");
const Farmer = require("../models/Farmer");
const DeliveryPartner = require("../models/DeliveryPartner");
const { generateOTP, sendEmail, otpEmailTemplate, isValidEmail } = require("../utils/emailService");

// Send OTP
router.post("/send", async (req, res) => {
    try {
        const { role, email, userData } = req.body;

        if (!role || !email || !userData) {
            return res.status(400).json({ message: "Role, Email and User Data are required" });
        }

        if (!isValidEmail(email)) {
             return res.status(400).json({ message: "Please provide a valid Gmail address (@gmail.com)" });
        }

        // Check if user already exists in the target collection
        let exists = false;
        if (role === 'customer') exists = await User.findOne({ email });
        else if (role === 'farmer') exists = await Farmer.findOne({ email });
        else if (role === 'delivery_partner') exists = await DeliveryPartner.findOne({ email });

        if (exists) {
            return res.status(400).json({ message: "Email already registered for this role" });
        }

        // Generate OTP
        const otp = generateOTP();

        // Save to PendingUser (overwrite if email already exists in pending)
        await PendingUser.deleteMany({ email, role });
        const pending = new PendingUser({
            role,
            email,
            otp,
            userData
        });
        await pending.save();

        // Send Email
        await sendEmail(
            email,
            "Farmly Registration Verification Code",
            otpEmailTemplate(otp)
        );

        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        console.error("OTP SEND ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// Verify OTP & Register
router.post("/verify", async (req, res) => {
    try {
        const { email, otp, role } = req.body;

        const pending = await PendingUser.findOne({ email, otp, role });
        if (!pending) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // All good, create the user
        const { userData } = pending;
        let resultUser;

        if (role === 'customer') {
            const newUser = new User({
                name: userData.username,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                address: userData.address
            });
            resultUser = await newUser.save();
        } else if (role === 'farmer') {
            const newFarmer = new Farmer({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                address: userData.address,
                location: userData.location
            });
            resultUser = await newFarmer.save();
        } else if (role === 'delivery_partner') {
            const newPartner = new DeliveryPartner({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                vehicleType: userData.vehicleType
            });
            resultUser = await newPartner.save();
        }

        // Clean up pending
        await PendingUser.deleteOne({ _id: pending._id });

        res.json({ 
            message: "Email verified and registration successful!",
            userId: resultUser._id,
            name: resultUser.name,
            role: role
        });

    } catch (err) {
        console.error("OTP VERIFY ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
