const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

dns.setServers(['8.8.8.8', '8.8.4.4']);

console.log('Testing connection to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB Atlas!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILURE:', err);
    process.exit(1);
  });
