const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const { sendEmail, orderEmailTemplate, isValidEmail } = require("../utils/emailService");

// Place a new order
router.post("/place", async (req, res) => {
    try {
        const { userId, items, totalAmount, address, phone } = req.body;
        
        if (!userId || !items || items.length === 0 || !totalAmount) {
            return res.status(400).json({ message: "Missing order details" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Precision Email Validation check (just in case)
        if (!isValidEmail(user.email)) {
             return res.status(400).json({ message: "User has an invalid email address. Cannot place order." });
        }

        // --- Inventory Check and Update ---
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.name} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}. Only ${product.quantity} ${product.unit} left.` });
            }
            // Ensure farmerId is populated in the order item
            item.farmerId = product.farmerId;
        }

        // Decrease stock
        for (const item of items) {
             const updatedProduct = await Product.findByIdAndUpdate(item.productId, {
                $inc: { quantity: -item.quantity }
            }, { new: true }).populate('farmerId');

            // --- Real-time Stock Alert System (Farmer Side) ---
            if (updatedProduct.quantity <= 0) {
                const farmer = updatedProduct.farmerId;
                if (farmer) {
                    console.log(`STOCK ALERT: Product "${updatedProduct.name}" is out of stock! Sending alert to farmer ${farmer.email}`);
                    
                    // Create In-App Notification
                    const Notification = require("../models/Notification");
                    const notification = new Notification({
                        farmerId: farmer._id,
                        productId: updatedProduct._id,
                        productName: updatedProduct.name,
                        message: `Your product "${updatedProduct.name}" is now OUT OF STOCK! Please restock soon.`
                    });
                    notification.save().catch(err => console.error("Notification Save error:", err));

                    // Send Email Alert
                    const { outOfStockEmailTemplate } = require("../utils/emailService");
                    sendEmail(
                        farmer.email,
                        `STOCK ALERT: ${updatedProduct.name} is Out of Stock`,
                        outOfStockEmailTemplate(farmer.name, updatedProduct.name)
                    ).catch(err => console.error("FARMER STOCK ALERT EMAIL ERROR:", err.message));
                }
            }
        }
        // ----------------------------------

        const order = new Order({
            userId,
            items,
            totalAmount,
            status: "Pending", // Default
            paymentStatus: "Pending", // For COD
            address: address || user.address || "N/A",
            phone: phone || user.phone || "N/A",
            location: user.location // Copy GPS coordinates for the delivery partner
        });

        await order.save();

        // Prepare order details for email
        const itemsHtml = items.map(item => 
            `<li>${item.name} - ${item.quantity} x ₹${item.price}</li>`
        ).join("");
        
        const orderSummary = `
            <ul>${itemsHtml}</ul>
            <p><strong>Total Amount: ₹${totalAmount}</strong></p>
            <p><strong>Shipping Address:</strong> ${address || user.address || "N/A"}</p>
        `;

        // Send Order Confirmation Email (Backgrounded)
        sendEmail(
            user.email,
            "Order Confirmed - Framly",
            orderEmailTemplate(user.name, orderSummary)
        ).catch(err => console.error("ORDER EMAIL ERROR:", err.message));

        res.status(201).json({ 
            message: "Order placed successfully!", 
            orderId: order._id 
        });
    } catch (err) {
        console.error("Order Placement Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET Active Order for Delivery Partner
router.get("/partner/:partnerId", async (req, res) => {
    try {
        const order = await Order.findOne({ 
            deliveryPartnerId: req.params.partnerId, 
            status: { $ne: "Delivered" } 
        })
        .populate("userId", "name phone location address")
        .populate("items.farmerId", "name phone location address")
        .sort({ updatedAt: -1 });

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user orders (history)
router.get("/user/:userId", async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .populate("deliveryPartnerId", "name phone currentLocation")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit Review
router.put("/submit-review/:id", async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const orderId = req.params.id;

        if (!rating) {
            return res.status(400).json({ message: "Rating is required." });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Robust check: case-insensitive and trimmed
        const currentStatus = order.status ? order.status.trim().toLowerCase() : "";
        if (currentStatus !== "delivered") {
            return res.status(400).json({ 
                message: `Can only review delivered orders (Current status: ${order.status})` 
            });
        }

        // Use findByIdAndUpdate for a cleaner atomic update
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    review: {
                        rating: Number(rating),
                        comment: comment || "",
                        reviewedAt: new Date()
                    }
                }
            },
            { new: true }
        );

        console.log(`REVIEW SUCCESS: Order #${orderId.slice(-6)} rated ${rating} stars.`);
        res.json({ message: "Review submitted successfully!", order: updatedOrder });
    } catch (err) {
        console.error("REVIEW SUBMISSION ERROR:", err);
        res.status(500).json({ 
            message: "Internal server error while saving feedback.", 
            error: err.message 
        });
    }
});

module.exports = router;
