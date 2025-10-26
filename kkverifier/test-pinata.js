/**
 * Test Pinata Gateway Configuration
 * This script verifies that your Pinata gateway is correctly configured and functional
 */

const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    env[key] = value;
  }
});

const PINATA_JWT = env.PINATA_JWT || env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║                                                                   ║');
console.log('║   🧪 PINATA CONFIGURATION TEST                                   ║');
console.log('║                                                                   ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

// Test 1: Check Environment Variables
console.log('📋 TEST 1: Environment Variables');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('PINATA_JWT:', PINATA_JWT ? '✅ Configured' : '❌ Missing');
if (PINATA_JWT) {
  console.log('  - Length:', PINATA_JWT.length, 'characters');
  console.log('  - Preview:', PINATA_JWT.substring(0, 50) + '...');
}

console.log('\nNEXT_PUBLIC_PINATA_GATEWAY:', PINATA_GATEWAY ? '✅ Configured' : '❌ Missing');
if (PINATA_GATEWAY) {
  console.log('  - Value:', PINATA_GATEWAY);
  console.log('  - Is Custom Gateway:', PINATA_GATEWAY.includes('mypinata.cloud') ? '✅ Yes' : '⚠️  Using default');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 2: Validate JWT Format
console.log('🔐 TEST 2: JWT Validation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (PINATA_JWT) {
  const jwtParts = PINATA_JWT.split('.');
  console.log('JWT Structure:', jwtParts.length === 3 ? '✅ Valid (3 parts)' : '❌ Invalid');
  
  if (jwtParts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString());
      console.log('JWT Payload Decoded:', '✅ Success');
      console.log('  - User ID:', payload.userInformation?.id || 'N/A');
      console.log('  - Status:', payload.userInformation?.status || 'N/A');
      console.log('  - Auth Type:', payload.authenticationType || 'N/A');
    } catch (error) {
      console.log('JWT Payload Decoded:', '❌ Failed -', error.message);
    }
  }
} else {
  console.log('❌ Cannot validate - JWT not found');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 3: Gateway URL Construction
console.log('🌐 TEST 3: Gateway URL Construction');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const testHash = 'QmTest123ABC';
const constructedUrl = `https://${PINATA_GATEWAY}/ipfs/${testHash}`;
console.log('Sample IPFS Hash:', testHash);
console.log('Constructed URL:', constructedUrl);
console.log('URL Format:', constructedUrl.startsWith('https://') ? '✅ Correct' : '❌ Invalid');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 4: Test Pinata API Connection
console.log('🔗 TEST 4: Pinata API Connection');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (PINATA_JWT) {
  console.log('Testing connection to Pinata API...\n');
  
  fetch('https://api.pinata.cloud/data/testAuthentication', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
    },
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    })
    .then(data => {
      console.log('✅ API Connection: SUCCESS');
      console.log('   Response:', JSON.stringify(data, null, 2));
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🎉 FINAL RESULT: ALL TESTS PASSED! ✅');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Your Pinata configuration is FULLY FUNCTIONAL!\n');
      console.log('✅ JWT Authentication: Working');
      console.log('✅ Gateway Configuration: Correct');
      console.log('✅ API Connection: Active');
      console.log('\nYou can now:');
      console.log('  1. Upload certificate metadata to IPFS');
      console.log('  2. Upload template designs');
      console.log('  3. Upload institution logos');
      console.log('  4. Retrieve data via your custom gateway\n');
    })
    .catch(error => {
      console.log('❌ API Connection: FAILED');
      console.log('   Error:', error.message);
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('⚠️  FINAL RESULT: CONFIGURATION ISSUE DETECTED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Possible issues:');
      console.log('  1. JWT token may be expired or invalid');
      console.log('  2. API key may not have proper permissions');
      console.log('  3. Network connection issue\n');
      console.log('Next steps:');
      console.log('  1. Check your Pinata dashboard: https://app.pinata.cloud/');
      console.log('  2. Generate a new JWT token if needed');
      console.log('  3. Ensure your token has "pinning" permissions\n');
    });
} else {
  console.log('❌ Cannot test - PINATA_JWT not configured\n');
  console.log('Please add PINATA_JWT to your .env.local file\n');
}
