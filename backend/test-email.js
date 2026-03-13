const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const { sendEmail, registrationEmailTemplate } = require('./utils/emailService');

async function testEmail() {
    console.log("Testing email with:");
    console.log("USER:", process.env.EMAIL_USER);
    console.log("PASS:", process.env.EMAIL_PASS ? "****" : "MISSING");
    
    try {
        await sendEmail(
            process.env.EMAIL_USER, // Send to self
            "Farmly - Test Email",
            registrationEmailTemplate("Test User")
        );
        console.log("SUCCESS: Email sent successfully!");
    } catch (err) {
        console.error("FAILURE: Error sending email:", err);
    }
}

testEmail();
