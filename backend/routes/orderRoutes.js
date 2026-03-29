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
            address: address || "N/A",
            phone: phone || user.phone || "N/A"
        });

        await order.save();

        // Prepare order details for email
        const itemsHtml = items.map(item => 
            `<li>${item.name} - ${item.quantity} x ₹${item.price}</li>`
        ).join("");
        
        const orderSummary = `
            <ul>${itemsHtml}</ul>
            <p><strong>Total Amount: ₹${totalAmount}</strong></p>
            <p><strong>Shipping Address:</strong> ${address || "N/A"}</p>
        `;

        // Send Order Confirmation Email (Backgrounded)
        console.log(`ORDER EMAIL TRIGGER: Attempting to send order confirmation to ${user.email}`);
        sendEmail(
            user.email,
            "Order Confirmed - Framly",
            orderEmailTemplate(user.name, orderSummary)
        ).then(info => console.log(`ORDER EMAIL SENT: ID ${info.messageId}`))
         .catch(err => console.error("ORDER EMAIL ERROR:", err.message));

        res.status(201).json({ 
            message: "Order placed successfully!", 
            orderId: order._id 
        });
    } catch (err) {
        console.error("Order Placement Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get user orders
router.get("/user/:userId", async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
