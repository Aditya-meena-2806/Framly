const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "backend", ".env") });

const Product = require("./backend/models/Product");
const Farmer = require("./backend/models/Farmer");

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB for cleanup...");

        const products = await Product.find({});
        let removedCount = 0;

        for (const product of products) {
            const farmer = await Farmer.findById(product.farmerId);
            if (!farmer) {
                await Product.findByIdAndDelete(product._id);
                console.log(`Removed orphaned product: ${product.name}`);
                removedCount++;
            }
        }

        console.log(`Cleanup complete. Removed ${removedCount} products.`);
        process.exit(0);
    } catch (err) {
        console.error("Cleanup error:", err);
        process.exit(1);
    }
}

cleanup();
