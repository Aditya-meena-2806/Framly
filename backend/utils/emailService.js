const nodemailer = require("nodemailer");
const validator = require("validator");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") }); // Ensure env is loaded inside service

/**
 * Validates if the email is in a correct format and belongs to a valid domain structure.
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !validator.isEmail(email)) return false;
    
    // Strictly only allow @gmail.com
    const emailLower = email.toLowerCase();
    return emailLower.endsWith('@gmail.com');
};

// Configure transporter with high reliability for Gmail
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// Verify connection
const verifyConnection = () => {
    transporter.verify(function (error, success) {
        if (error) {
            console.error("EMAIL SERVICE ERROR: Connection failed!", error.message);
        } else {
            console.log("EMAIL SERVICE READY: Server is ready to take our messages");
        }
    });
};

verifyConnection();

/**
 * Sends a premium email notification.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email content in HTML
 */
const sendEmail = async (to, subject, html) => {
    console.log(`EMAIL ATTEMPT: Sending to ${to} | Subject: ${subject}`);
    
    if (!isValidEmail(to)) {
        console.error(`EMAIL FAILED: Invalid address ${to}`);
        throw new Error("Invalid recipient email address");
    }

    const mailOptions = {
        from: {
            name: 'Farmly Fresh Support',
            address: process.env.EMAIL_USER
        },
        to,
        subject,
        text: subject, // Simple plain text fallback
        html,
        priority: 'high'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("EMAIL SUCCESS: ID " + info.messageId + " | Response: " + info.response);
        return info;
    } catch (error) {
        console.error("EMAIL CRITICAL ERROR:", error);
        throw error;
    }
};

/**
 * Email Template for Registration
 */
const registrationEmailTemplate = (name) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; background-color: #2e7d32; padding: 10px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to Farmly</h1>
        </div>
        <div style="padding: 20px; color: #333;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for joining <strong>Farmly</strong>! We are excited to have you as part of our community connecting farmers directly with customers.</p>
            <p>Your account has been successfully created. You can now explore fresh produce or manage your listings if you are a farmer.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #2e7d32; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Farmly</a>
            </div>
            <p>If you have any questions, feel free to reply to this email.</p>
            <br>
            <p>Best Regards,<br>The Farmly Team</p>
        </div>
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #777;">
            &copy; 2026 Farmly. All Rights Reserved.
        </div>
    </div>
`;

/**
 * Email Template for Order Confirmation
 */
const orderEmailTemplate = (name, orderDetails) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; background-color: #ff6f00; padding: 10px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
        </div>
        <div style="padding: 20px; color: #333;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Great news! Your order has been placed successfully. Our farmers are now preparing your fresh items for delivery.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #ff6f00;">Order Details:</h3>
                <p>${orderDetails}</p>
            </div>
            <p>We'll notify you once your order is shipped.</p>
            <p>Thank you for supporting local farmers!</p>
            <br>
            <p>Best Regards,<br>The Farmly Team</p>
        </div>
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #777;">
            &copy; 2026 Farmly. All Rights Reserved.
        </div>
    </div>
`;

/**
 * Email Template for Farmer Approval
 */
const farmerApprovalEmailTemplate = (name) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; background-color: #2e7d32; padding: 10px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Account Approved!</h1>
        </div>
        <div style="padding: 20px; color: #333;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Great news! Your Farmly <strong>Farmer Account</strong> has been fully verified and approved by our admin team.</p>
            <p>You can now log in to your dashboard to start adding your fresh produce and connecting directly with customers.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/farmer/farmerLogin.html" style="background-color: #2e7d32; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
            </div>
            <p>Welcome to the Farmly family! We look forward to seeing your products.</p>
            <br>
            <p>Best Regards,<br>The Farmly Team</p>
        </div>
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #777;">
            &copy; 2026 Farmly. All Rights Reserved.
        </div>
    </div>
`;

/**
 * Email Template for Out of Stock Notification
 */
const outOfStockEmailTemplate = (name, productName) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; background-color: #d32f2f; padding: 10px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Stock Alert!</h1>
        </div>
        <div style="padding: 20px; color: #333;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>This is an automated notification to let you know that your product <strong>"${productName}"</strong> is now <strong>OUT OF STOCK</strong>.</p>
            <p>Customers will no longer be able to purchase this item until you restock it.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/farmer/farmer-dashboard.html" style="background-color: #d32f2f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restock Now</a>
            </div>
            <p>To restock, log in to your dashboard and update the product quantity.</p>
            <br>
            <p>Best Regards,<br>The Farmly Team</p>
        </div>
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #777;">
            &copy; 2026 Farmly. All Rights Reserved.
        </div>
    </div>
`;

/**
 * Email Template for Order Delivered
 */
const orderDeliveredEmailTemplate = (name, orderId) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; background-color: #2e7d32; padding: 10px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Order Delivered! 🧺</h1>
        </div>
        <div style="padding: 20px; color: #333;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Great news! Your Farmly order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been successfully delivered.</p>
            <p>We hope you enjoy your fresh produce! Your support helps local farmers thrive.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #bae6fd; text-align: center;">
                <p style="margin-top: 0; color: #0369a1; font-weight: bold;">How was your experience?</p>
                <p style="font-size: 0.9rem;">Please take a moment to rate the product quality and delivery service.</p>
                <div style="margin-top: 20px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/order-history.html" style="background-color: #0369a1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Give Feedback ✨</a>
                </div>
            </div>

            <p>Thank you for choosing Farmly!</p>
            <br>
            <p>Best Regards,<br>The Farmly Team</p>
        </div>
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #777;">
            &copy; 2026 Farmly. All Rights Reserved.
        </div>
    </div>
`;

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Email Template for OTP Verification
 */
const otpEmailTemplate = (otp) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; background-color: #2e7d32; padding: 10px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Verify Your Email</h1>
        </div>
        <div style="padding: 20px; color: #333;">
            <p>Verification Code:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="background-color: #f4f4f4; color: #2e7d32; padding: 10px 20px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 5px;">${otp}</span>
            </div>
            <p>Please enter this code on the registration page to complete your signup. This code will expire in 10 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <br>
            <p>Best Regards,<br>The Farmly Team</p>
        </div>
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #777;">
            &copy; 2026 Farmly. All Rights Reserved.
        </div>
    </div>
`;

module.exports = {
    isValidEmail,
    sendEmail,
    generateOTP,
    otpEmailTemplate,
    registrationEmailTemplate,
    orderEmailTemplate,
    farmerApprovalEmailTemplate,
    outOfStockEmailTemplate,
    orderDeliveredEmailTemplate
};
