const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

console.log("Checking email credentials:");
console.log("User:", process.env.EMAIL_USER);
console.log("Pass length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error("EMAIL SERVICE ERROR:", error);
    } else {
        console.log("EMAIL SERVICE READY!");
    }
});
