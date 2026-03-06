const express = require("express");
const router = express.Router();
const Farmer = require("../models/Farmer");
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// Helper to save base64 image
const saveImage = (base64Data) => {
    if (!base64Data) return null;
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `product-${Date.now()}.png`; // improved extension handling could be done but png/jpg is fine
    const uploadPath = path.join(__dirname, "../uploads", fileName);

    // Ensure directory exists
    if (!fs.existsSync(path.join(__dirname, "../uploads"))) {
        fs.mkdirSync(path.join(__dirname, "../uploads"));
    }

    fs.writeFileSync(uploadPath, buffer);
    return `/uploads/${fileName}`;
};

//  Farmer Registration
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, location, phone } = req.body;
        const farmer = new Farmer({ name, email, password, location, phone });
        await farmer.save();
        res.json({ message: "Farmer registered successfully (waiting for admin approval)" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


//  Farmer Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const farmer = await Farmer.findOne({ email, password });
        if (!farmer) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!farmer.approved) {
            return res.status(403).json({ message: "Account pending admin approval" });
        }

        res.json({
            message: "Login successful",
            farmerId: farmer._id,
            name: farmer.name,
            email: farmer.email,
            phone: farmer.phone || "N/A"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Farmer Profile for Dashboard Sync
router.get("/profile/:id", async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id);
        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found" });
        }
        res.json({
            name: farmer.name,
            email: farmer.email,
            phone: farmer.phone || "N/A"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//  Add Product (with Image)
router.post("/add-product", async (req, res) => {
    try {
        const { name, price, quantity, unit, category, image, farmerId } = req.body;

        const imagePath = saveImage(image);

        const product = new Product({
            name,
            price,
            quantity,
            unit,
            category,
            image: imagePath,
            farmerId,
            isApproved: false // Default to false
        });

        await product.save();
        res.json({ message: "Product added successfully! Waiting for Admin Approval." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


//  View Farmer Products
router.get("/products/:farmerId", async (req, res) => {
    try {
        const products = await Product.find({ farmerId: req.params.farmerId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//  Delete Product
router.delete("/delete-product/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
