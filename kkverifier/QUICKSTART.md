# ⚡ Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (2 min)

```bash
cd /c/Users/goura/Downloads/kkverifier
npm install
```

This will install:

- Next.js 14
- React 18
- Ethers.js v6
- Tailwind CSS
- All other dependencies

### Step 2: Create Environment File (1 min)

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your contract addresses (get these from your teammate):

```env
NEXT_PUBLIC_NETWORK_NAME=polygon-mumbai
NEXT_PUBLIC_CHAIN_ID=80001

# Replace with actual addresses
NEXT_PUBLIC_CONTRACT_CERTIFICATE=0xYourCertificateAddress
NEXT_PUBLIC_CONTRACT_ORGANIZATION=0xYourOrgAddress
NEXT_PUBLIC_CONTRACT_USER_IDENTITY=0xYourUserIdentityAddress
NEXT_PUBLIC_CONTRACT_BADGE_SYSTEM=0xYourBadgeSystemAddress
```

### Step 3: Update Contract Config (1 min)

Edit `src/contracts/config.js` and update the addresses:

```javascript
export const CONTRACTS = {
  "polygon-mumbai": {
    CertificateManagement: "0xYourAddress", // Update this
    OrganizationRegistry: "0xYourAddress", // Update this
    UserIdentity: "0xYourAddress", // Update this
    BadgeSystem: "0xYourAddress", // Update this
  },
};
```

### Step 4: Run Development Server (1 min)

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

---

## 🎯 First Time Setup Checklist

### Before Starting:

- [ ] Node.js 18+ installed
- [ ] MetaMask installed in browser
- [ ] Have contract addresses from teammate
- [ ] Have test MATIC in wallet (from faucet)
- [ ] MetaMask connected to Mumbai testnet

### Quick Test Flow:

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Go to "Issue" page
5. Fill in certificate form
6. Submit (will prompt for transaction)
7. Go to "Verify" with the certificate ID
8. See your certificate!

---

## 🔄 If You Need to Update ABIs

When your teammate provides the compiled contracts:

1. Ask for the ABI from: `artifacts/contracts/YourContract.sol/YourContract.json`
2. Open `src/contracts/abis.js`
3. Replace the function signatures with actual ABI

Example:

```javascript
// Instead of:
export const CertificateManagementABI = [
  'function issueCertificate(...)',
]

// Use the actual ABI array from the JSON:
export const CertificateManagementABI = [
  {
    "inputs": [...],
    "name": "issueCertificate",
    "outputs": [...],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ... rest of ABI
]
```

---

## 🧪 Quick Test Scenarios

### Test 1: Wallet Connection

- Go to homepage
- Click "Connect Wallet"
- Approve in MetaMask
- See address in navbar

### Test 2: Issue Certificate

- Go to /issue
- Fill form:
  - Recipient: Your wallet address
  - Type: "Course Completion"
  - Name: "Test Certificate"
  - Details: "This is a test"
- Click "Issue Certificate"
- Approve transaction in MetaMask
- Wait for confirmation
- Note the Certificate ID

### Test 3: Verify Certificate

- Go to /verify
- Enter the Certificate ID
- Click "Verify"
- See certificate displayed
- Try downloading as PDF

### Test 4: Dashboard

- Go to /dashboard
- See your issued certificate
- Click "View" to see details

---

## ⚠️ Common Issues & Quick Fixes

### Issue: "Cannot read properties of null"

**Fix**: Make sure you've updated contract addresses in `config.js`

### Issue: "Unsupported chain"

**Fix**: Add Mumbai testnet to MetaMask:

- Network Name: Mumbai
- RPC URL: https://rpc-mumbai.maticvigil.com/
- Chain ID: 80001
- Currency: MATIC

### Issue: "Transaction reverted"

**Fix**: Check:

1. You have enough MATIC for gas
2. Your address is a verified organization (for issuing)
3. Contract function signatures match

### Issue: MetaMask not connecting

**Fix**:

1. Refresh the page
2. Unlock MetaMask
3. Check if correct network is selected
4. Clear browser cache

---

## 📝 What Your Teammate Needs to Provide

Create a checklist and send to your teammate:

```
Smart Contract Integration Checklist:

☐ Deployed contract addresses on Mumbai testnet:
  - CertificateManagement: 0x_______________
  - OrganizationRegistry: 0x_______________
  - UserIdentity: 0x_______________
  - BadgeSystem: 0x_______________

☐ Contract ABIs (JSON files from artifacts/)

☐ Verification on Polygonscan (optional but helpful)

☐ Test transaction hash (so I can verify it worked)

☐ Any special requirements or custom logic
```

---

## 🎨 Customization Quick Tips

### Change Colors:

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: '#YOUR_COLOR',    // Main blue
  secondary: '#YOUR_COLOR',  // Green
  accent: '#YOUR_COLOR',     // Yellow
}
```

### Change Logo:

Replace files in `public/` folder:

- logo.svg
- icon-192.png
- icon-512.png

### Change App Name:

Edit `src/contracts/config.js`:

```javascript
export const APP_CONFIG = {
  appName: "Your App Name",
  appDescription: "Your description",
};
```

---

## 📦 Build for Production

When everything works:

```bash
# Build the app
npm run build

# Test production build locally
npm run start

# Deploy to Vercel (recommended)
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard (same as `.env.local`)

---

## 🎯 Success Criteria

You'll know it's working when:

- ✅ Wallet connects successfully
- ✅ Can issue a certificate
- ✅ Certificate appears in dashboard
- ✅ Can verify certificate
- ✅ Can download certificate as PDF
- ✅ No console errors
- ✅ Transactions confirm on Polygonscan

---

## 📞 Still Stuck?

1. Check `SETUP.md` for detailed instructions
2. Check `INTEGRATION_GUIDE.md` for smart contract help
3. Look at browser console for errors
4. Check MetaMask for transaction details
5. Verify on Polygonscan: https://mumbai.polygonscan.com/

---

## 🎉 You're All Set!

The app is ready to go. Just need those contract addresses and you'll be issuing certificates in no time!

**Happy Building! 🚀**
