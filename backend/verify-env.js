// Environment Variables Verification Script
require('dotenv').config();

console.log('\n========================================');
console.log('Environment Variables Verification');
console.log('========================================\n');

const requiredVars = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
  'CLIENT_URL'
];

const optionalVars = [
  'DB_PASSWORD',
  'DB_PORT',
  'JWT_EXPIRE',
  'NODE_ENV'
];

let allGood = true;

console.log('Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✓' : '✗';
  const display = value ? (varName === 'JWT_SECRET' ? '[HIDDEN]' : value) : 'MISSING';
  console.log(`  ${status} ${varName}: ${display}`);
  if (!value) allGood = false;
});

console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✓' : '-';
  const display = value ? (varName === 'DB_PASSWORD' ? '[HIDDEN]' : value) : 'Not set (using default)';
  console.log(`  ${status} ${varName}: ${display}`);
});

console.log('\n========================================');
if (allGood) {
  console.log('✓ All required variables are set!');
  console.log('✓ Ready to start the server');
} else {
  console.log('✗ Some required variables are missing!');
  console.log('✗ Please check your .env file');
}
console.log('========================================\n');

process.exit(allGood ? 0 : 1);
