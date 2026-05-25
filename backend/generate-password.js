// Script to generate bcrypt password hash
const bcrypt = require('bcryptjs');

const password = 'admin123';

bcrypt.genSalt(10, (err, salt) => {
  if (err) {
    console.error('Error generating salt:', err);
    return;
  }
  
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }
    
    console.log('\n========================================');
    console.log('Password Hash Generator');
    console.log('========================================');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('========================================\n');
    console.log('Copy this hash and update setup.sql');
    console.log('========================================\n');
  });
});
