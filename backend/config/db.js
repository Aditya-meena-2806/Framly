const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
    try {
        // Force IPv4 and set DNS
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
        
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4 // Force IPv4
        });

        console.log("MongoDB Connected ");
    } catch (error) {
        console.error("MongoDB Connection Failed ", error);
        process.exit(1);
    }
};

module.exports = connectDB;

