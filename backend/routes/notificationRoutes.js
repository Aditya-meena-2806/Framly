const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Get farmer notifications
router.get("/farmer/:farmerId", async (req, res) => {
    try {
        const notifications = await Notification.find({ farmerId: req.params.farmerId })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark as read
router.patch("/read/:id", async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
