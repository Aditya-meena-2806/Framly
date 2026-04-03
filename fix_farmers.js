const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const Farmer = require('./backend/models/Farmer');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB for maintenance...');
        
        // Fix Aditya Jharwal specifically (from user screenshot)
        await Farmer.findOneAndUpdate(
            { name: "Aditya Jharwal" }, 
            { address: "Sector 10, Jagatpura, Jaipur" }
        );

        // Update all others who are missing address
        const result = await Farmer.updateMany(
            { address: { $exists: false } }, 
            { $set: { address: "Farmly Verified Location, Jaipur" } }
        );

        const result2 = await Farmer.updateMany(
            { address: null }, 
            { $set: { address: "Farmly Verified Location, Jaipur" } }
        );

        console.log(`Updated Farmers: ${result.modifiedCount + result2.modifiedCount}`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Maintenance Error:', err);
        process.exit(1);
    });
