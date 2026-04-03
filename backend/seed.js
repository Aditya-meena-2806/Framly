const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load models
const User = require('./models/User');
const Farmer = require('./models/Farmer');
const Admin = require('./models/Admin');
const Product = require('./models/Product');

const dns = require('dns');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const seedDatabase = async () => {
    try {
        // Fix for DNS SRV resolution and IPv6 issues
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        
        console.log("Connected to MongoDB Atlas for seeding...");

        // Clear existing data (optional - be careful)
        await User.deleteMany({});
        await Farmer.deleteMany({});
        await Admin.deleteMany({});
        await Product.deleteMany({});

        console.log("Cleared existing data.");

        // Create Admin
        const admin = await Admin.create({
            username: "admin_user",
            password: "admin123" // In a real app, hash this
        });
        console.log("Admin dummy created.");

        // Create Farmer
        const farmer = await Farmer.create({
            name: "Farmer John",
            email: "farmer@example.com",
            password: "farmer123",
            phone: "1234567890",
            location: "Farm City",
            approved: true
        });
        console.log("Farmer dummy created.");

        // Create Customer (using User model)
        const customer = await User.create({
            name: "Jane Doe",
            email: "customer@example.com",
            password: "customer123",
            phone: "0987654321",
            address: "123 Main St",
            isBlocked: false
        });
        console.log("Customer dummy created.");

        // Create a dummy product for the farmer
        await Product.create({
            name: "Organic Tomatoes",
            price: 2.5,
            quantity: 50,
            unit: "kg",
            category: "Vegetable",
            isApproved: true,
            farmerId: farmer._id
        });
        console.log("Product dummy created.");

        console.log("Database seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
