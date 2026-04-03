const dns = require('dns');

const hostname = 'cluster0.51xoym9.mongodb.net';

dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
  if (err) {
    console.error('SRV Resolution Error:', err);
  } else {
    console.log('SRV Records:', addresses);
  }
});
