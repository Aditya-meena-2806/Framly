const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");

// Helper: Haversine Formula for Distance in KM
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Register Delivery Partner
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone, vehicleType } = req.body;
        const exists = await DeliveryPartner.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const newUser = new DeliveryPartner({ name, email, password, phone, vehicleType });
        await newUser.save();
        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login Delivery Partner
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await DeliveryPartner.findOne({ email });
        if (!user) return res.status(404).json({ message: "Partner not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        res.json({ 
            id: user._id, 
            name: user.name, 
            email: user.email,
            phone: user.phone,
            vehicleType: user.vehicleType 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Partner Profile
router.get("/profile/:id", async (req, res) => {
    try {
        const partner = await DeliveryPartner.findById(req.params.id);
        res.json(partner);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Available Orders
router.get("/available-orders", async (req, res) => {
    try {
        const orders = await Order.find({ status: "Pending", deliveryPartnerId: null })
            .populate("userId", "name phone location address")
            .populate("items.farmerId", "name phone location address");
        
        // Calculate payout (₹10/km with a base of ₹20)
        const ordersWithPayout = orders.map(o => {
            const orderObj = o.toObject();
            
            // Get coordinates (using first item's farmer as pickup point)
            const farmerLoc = (orderObj.items[0] && orderObj.items[0].farmerId) ? orderObj.items[0].farmerId.location : null;
            const customerLoc = (orderObj.userId && orderObj.userId.location) ? orderObj.userId.location : orderObj.location;

            let payout = 20; // Base Fare
            if (farmerLoc && customerLoc && farmerLoc.lat && customerLoc.lat) {
                const dist = calculateDistance(farmerLoc.lat, farmerLoc.lng, customerLoc.lat, customerLoc.lng);
                payout = Math.max(20, dist * 10);
            }
            
            orderObj.payout = payout.toFixed(2);
            return orderObj;
        });

        res.json(ordersWithPayout);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Repair Orders (Attach farmerId to items that only have productId)
router.get("/repair-orders", async (req, res) => {
    try {
        const Product = require("../models/Product");
        const orders = await Order.find();
        let changedCount = 0;

        for (let order of orders) {
            let changed = false;
            for (let item of order.items) {
                if (!item.farmerId && item.productId) {
                    const product = await Product.findById(item.productId);
                    if (product && product.farmerId) {
                        item.farmerId = product.farmerId;
                        changed = true;
                    }
                }
            }
            if (changed) {
                await order.save();
                changedCount++;
            }
        }
        res.json({ message: `Repaired ${changedCount} orders successfully!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Accept Order
router.put("/accept-order/:orderId", async (req, res) => {
    try {
        const { partnerId } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.orderId, {
            deliveryPartnerId: partnerId,
            status: "Accepted"
        }, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reject/Cancel Task (Return to Pool)
router.put("/reject-order/:orderId", async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.orderId, {
            deliveryPartnerId: null,
            status: "Pending"
        }, { new: true });
        res.json({ message: "Task rejected successfully", order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Final Cancel (Dead Task)
router.put("/cancel-order/:orderId", async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.orderId, {
            status: "Cancelled"
        }, { new: true });
        res.json({ message: "Task cancelled successfully", order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Order Status (Picked Up, Shipped, Delivered)
router.put("/update-status/:orderId", async (req, res) => {
    try {
        const { status } = req.body;
        const updateData = { status };
        
        if (status === "Delivered") {
            updateData.deliveredAt = new Date();
        }

        const order = await Order.findByIdAndUpdate(req.params.orderId, updateData, { new: true })
            .populate("userId", "name email");

        // --- Post-Delivery Email Trigger ---
        if (updateData.status === "Delivered" && order && order.userId) {
            const { sendEmail, orderDeliveredEmailTemplate, isValidEmail } = require("../utils/emailService");
            if (isValidEmail(order.userId.email)) {
                sendEmail(
                    order.userId.email,
                    `Your Order #${order._id.toString().slice(-8).toUpperCase()} has Been Delivered!`,
                    orderDeliveredEmailTemplate(order.userId.name, order._id.toString())
                ).catch(err => console.error("DELIVERY EMAIL ERROR:", err.message));
            }
        }
        // ------------------------------------

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Partner Live Location
router.put("/update-location/:partnerId", async (req, res) => {
    try {
        const { lat, lng } = req.body;
        await DeliveryPartner.findByIdAndUpdate(req.params.partnerId, {
            currentLocation: { lat, lng }
        });
        res.json({ message: "Location updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Partner Order History
router.get("/history/:partnerId", async (req, res) => {
    try {
        const history = await Order.find({ 
            deliveryPartnerId: req.params.partnerId, 
            status: "Delivered" 
        }).populate("userId", "name phone address")
          .populate("items.farmerId", "name phone address");

        let totalEarnings = 0;
        let todayCount = 0;
        const todayStr = new Date().toDateString();

        const mappedHistory = history.map(o => {
            const orderObj = o.toObject();
            
            // Calculate distance-based payout
            const farmerLoc = (orderObj.items[0] && orderObj.items[0].farmerId) ? orderObj.items[0].farmerId.location : null;
            const customerLoc = (orderObj.userId && orderObj.userId.location) ? orderObj.userId.location : orderObj.location;

            let payoutAmount = 20;
            if (farmerLoc && customerLoc && farmerLoc.lat && customerLoc.lat) {
                const dist = calculateDistance(farmerLoc.lat, farmerLoc.lng, customerLoc.lat, customerLoc.lng);
                payoutAmount = Math.max(20, dist * 10);
            }

            orderObj.payout = payoutAmount.toFixed(2);
            totalEarnings += payoutAmount;

            if (new Date(orderObj.deliveredAt).toDateString() === todayStr) {
                todayCount++;
            }
            return orderObj;
        });

        res.json({
            history: mappedHistory,
            totalEarnings: totalEarnings.toFixed(2),
            todayCount: todayCount,
            count: mappedHistory.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Temporary Seeding Route
router.get("/temp-seed", async (req, res) => {
    try {
        const User = require("../models/User");
        const Farmer = require("../models/Farmer");

        // 1. Create Partner
        const email = "rahul@express.com";
        let partner = await DeliveryPartner.findOne({ email });
        if (!partner) {
            partner = new DeliveryPartner({
                name: "Rahul Express",
                email,
                password: "password123", // Pre-hash ignored in temp seed for speed
                phone: "9876543210",
                vehicleType: "Bike"
            });
            await partner.save();
        }

        // 2. Sample Orders
        const users = await User.find().limit(1);
        const farmers = await Farmer.find().limit(1);
        if (users.length && farmers.length) {
            const history = [
                { t: 400, d: "2026-03-26" },
                { t: 900, d: "2026-03-27" },
                { t: 1200, d: "2026-03-28" }
            ];
            for (const h of history) {
                await new Order({
                    userId: users[0]._id,
                    deliveryPartnerId: partner._id,
                    items: [{ productId: users[0]._id, farmerId: farmers[0]._id, name: "Fresh Harvest", quantity: 1, price: h.t }],
                    totalAmount: h.t,
                    status: "Delivered",
                    deliveredAt: new Date(h.d)
                }).save();
            }
        }
        res.json({ message: "History Seeded Successfully!", partner: { email: "rahul@express.com", pass: "password123" } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
