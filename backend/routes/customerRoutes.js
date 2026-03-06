const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Customer Registration
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        console.log("REGISTRATION DATA RECEIVED:", { username, email, phone });

        // Basic validation
        if (!username || !email || !password || !phone) {
            console.log("REGISTRATION FAILED: Missing fields");
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({ name: username, email, password, phone });
        await user.save();

        res.json({ message: "Registration Successful", userId: user._id, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Customer Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "Account is blocked by Admin" });
        }

        res.json({ 
            message: "Login Successful", 
            userId: user._id, 
            name: user.name, 
            email: user.email,
            phone: user.phone 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Customer Profile Info
router.get("/profile/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            version: "v4_robust",
            name: user.name || "N/A",
            email: user.email || "N/A",
            phone: user.phone || "N/A"
        });
    } catch (err) {
        console.error("Profile Fetch Error for ID:", req.params.id, err);
        res.status(500).json({ version: "v4_robust", error: err.message });
    }
});

// Status check route
router.get("/status", (req, res) => {
    res.json({ status: "running", version: "v4_robust", time: new Date() });
});

module.exports = router;
