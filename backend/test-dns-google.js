const dns = require('dns');

// Use Google DNS servers for this process
dns.setServers(['8.8.8.8', '8.8.4.4']);

const hostname = 'cluster0.51xoym9.mongodb.net';

console.log('Testing SRV resolution with Google DNS (8.8.8.8)...');

dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
  if (err) {
    console.error('SRV Resolution Error:', err);
  } else {
    console.log('SRV Records:', addresses);
  }
});
