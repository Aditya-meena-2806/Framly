const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Use path.join to be safe with relative paths
const DeliveryPartner = require(path.join(__dirname, "models", "DeliveryPartner"));
const Order = require(path.join(__dirname, "models", "Order"));
const User = require(path.join(__dirname, "models", "User"));
const Farmer = require(path.join(__dirname, "models", "Farmer"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/farmly";

async function seedHistory() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Database Connected for Seeding V2...");

        // 1. Create a Delivery Partner
        const partnerEmail = "rahul@express.com";
        let partner = await DeliveryPartner.findOne({ email: partnerEmail });
        if (!partner) {
            partner = new DeliveryPartner({
                name: "Rahul Express",
                email: partnerEmail,
                password: "password123", 
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
            console.log("No users or farmers found.");
            process.exit(0);
        }

        // 3. Create 5 'Delivered' orders for history
        const historyData = [
            { total: 550, date: new Date("2026-03-24") },
            { total: 1300, date: new Date("2026-03-25") },
            { total: 950, date: new Date("2026-03-26") },
            { total: 420, date: new Date("2026-03-27") },
            { total: 1600, date: new Date("2026-03-28") }
        ];

        for (const data of historyData) {
            const order = new Order({
                userId: users[0]._id,
                deliveryPartnerId: partner._id,
                items: [{
                    productId: new mongoose.Types.ObjectId(), 
                    farmerId: farmers[0]._id,
                    name: "Fresh Harvest",
                    quantity: 1,
                    price: data.total
                }],
                totalAmount: data.total,
                status: "Delivered",
                address: "Sample Address, Delhi",
                phone: "1234567890",
                deliveredAt: data.date
            });
            await order.save();
        }

        console.log(`Successfully seeded history! TOTAL: ${historyData.length} Successes.`);
        process.exit(0);
    } catch (err) {
        console.error("SEEDING ERROR:", err.message);
        process.exit(1);
    }
}

seedHistory();
