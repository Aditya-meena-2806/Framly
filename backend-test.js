const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

console.log("SENDING TEST FROM:", process.env.EMAIL_USER);

transporter.sendMail({
    from: `"Farmly Fresh" <${process.env.EMAIL_USER}>`,
    to: "aditya28.2uall@gmail.com",
    subject: "STRICT TEST FROM NEW GMAIL",
    text: "This email was sent using credentials: " + process.env.EMAIL_USER
}, (err, info) => {
    if (err) console.error("ERROR:", err);
    else console.log("SENT SUCCESSFULLY:", info.response);
});
