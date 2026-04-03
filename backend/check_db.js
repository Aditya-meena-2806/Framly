const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI); 
        const users = await User.find({}).limit(5);
        console.log('USERS IN DB:');
        users.forEach(u => {
            console.log(`- ID: ${u._id}, Email: ${u.email}, Phone: ${u.phone}`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
check();
