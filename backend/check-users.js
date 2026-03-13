const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'name email');
        console.log("Existing Users:");
        users.forEach(u => console.log(`- ${u.name}: ${u.email}`));
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
