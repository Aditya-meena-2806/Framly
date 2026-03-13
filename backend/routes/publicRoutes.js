const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Get All Approved Products for Customer (with optional search)
router.get("/products", async (req, res) => {
    try {
        const { search } = req.query;
        if (search) {
            console.log(`Searching for: "${search}"`);
        }
        let query = { isApproved: true };
        
        if (search && search.trim() !== "") {
            query.name = { $regex: search.trim(), $options: "i" };
        }

        const products = await Product.find(query).populate("farmerId", "name location");
        
        // Filter out products where the farmer no longer exists (orphaned products)
        const validProducts = products.filter(p => p.farmerId !== null);
        
        res.json(validProducts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
