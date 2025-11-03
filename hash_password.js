// Create a new script, hash_password.js
const bcrypt = require('bcrypt');

const password = 'Admin@123'; // Replace with your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hashed Password:', hash);
});
