const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("USER:|" + process.env.EMAIL_USER + "|");
console.log("PASS:|" + process.env.EMAIL_PASS + "|");
