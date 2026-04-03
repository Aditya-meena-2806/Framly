const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend", ".env") });

const DeliveryPartner = require("./backend/models/DeliveryPartner");
const Order = require("./backend/models/Order");
const User = require("./backend/models/User");
const Farmer = require("./backend/models/Farmer");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/farmly";

async function seedHistory() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Database Connected for Seeding History...");

        // 1. Create a Delivery Partner
        const partnerEmail = "rahul@express.com";
        let partner = await DeliveryPartner.findOne({ email: partnerEmail });
        if (!partner) {
            partner = new DeliveryPartner({
                name: "Rahul Express",
                email: partnerEmail,
                password: "password123", // Will be hashed by pre-save
                phone: "9876543210",
                vehicleType: "Bike",
                status: "Idle",
                currentLocation: { lat: 28.6139, lng: 77.2090 }
            });
            await partner.save();
            console.log("Delivery Partner Created: Rahul Express");
        }

        // 2. Find some users and farmers
        const users = await User.find().limit(2);
        const farmers = await Farmer.find().limit(2);

        if (users.length === 0 || farmers.length === 0) {
            console.log("No users or farmers found. Please run the main seed script first.");
            process.exit(0);
        }

        // 3. Create 5 'Delivered' orders for history
        const historyData = [
            { total: 450, date: new Date("2026-03-25") },
            { total: 1200, date: new Date("2026-03-26") },
            { total: 850, date: new Date("2026-03-27") },
            { total: 320, date: new Date("2026-03-28") },
            { total: 1500, date: new Date("2026-03-29T10:00:00") }
        ];

        for (let i = 0; i < historyData.length; i++) {
            const data = historyData[i];
            const order = new Order({
                userId: users[0]._id,
                deliveryPartnerId: partner._id,
                items: [{
                    productId: new mongoose.Types.ObjectId(), // dummy
                    farmerId: farmers[0]._id,
                    name: "Fresh Tomatoes",
                    quantity: 2,
                    price: 40
                }],
                totalAmount: data.total,
                status: "Delivered",
                address: users[0].address || "H-24, Green Park, Delhi",
                phone: users[0].phone || "1234567890",
                location: users[0].location || { lat: 28.6, lng: 77.2 },
                deliveredAt: data.date
            });
            await order.save();
        }

        console.log(`Successfully seeded ${historyData.length} delivered orders for history!`);
        console.log("\n-------------------------------------------");
        console.log("Login Details for Testing History:");
        console.log(`Email: ${partnerEmail}`);
        console.log("Password: password123");
        console.log("-------------------------------------------");

        process.exit(0);
    } catch (err) {
        console.error("SEEDING ERROR:", err.message);
        process.exit(1);
    }
}

seedHistory();
