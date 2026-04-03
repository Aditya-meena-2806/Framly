const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/emailService");

// @route   POST /api/support/send
// @desc    Relay support messages to Farmly HQ
// @access  Public
router.post("/send", async (req, res) => {
    try {
        const { name, email, category, message, type } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hqEmail = "Farmly.2809@gmail.com";
        const subject = `[${type.toUpperCase()} SUPPORT] - New Inquiry from ${name}`;
        
        const htmlContent = `
            <div style="font-family: 'Outfit', sans-serif; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px;">
                <h2 style="color: #2e7d32; border-bottom: 2px solid #f0fdf4; padding-bottom: 15px;">New Farmly Support Ticket</h2>
                <p><strong>Sender Rank:</strong> ${type.toUpperCase()}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Category:</strong> ${category || 'General'}</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;">
                <p style="font-weight: 600; font-size: 1.1rem;">Message Details:</p>
                <p style="background: #f8fafc; padding: 20px; border-radius: 12px; font-style: italic;">"${message}"</p>
                <footer style="margin-top: 40px; font-size: 0.8rem; color: #64748b; text-align: center;">
                    <p>&copy; 2026 Farmly HQ | Jagatpura, Jaipur</p>
                </footer>
            </div>
        `;

        await sendEmail(hqEmail, subject, htmlContent);

        res.status(200).json({ success: true, message: "Support relay successful" });
    } catch (err) {
        console.error("Support Relay Error:", err.message);
        res.status(500).json({ message: "Failed to relay support message" });
    }
});

module.exports = router;
