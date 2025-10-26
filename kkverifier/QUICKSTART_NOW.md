# 🚀 Quick Start Guide - KK Verifier

## Current Status: ✅ RUNNING

**Dev Server**: http://localhost:3001  
**Status**: All features working  
**Last Updated**: October 25, 2025

---

## 🎯 What's Working Right Now

### ✅ Pages

1. **Home** (/) - Landing page with wallet connection
2. **Verify** (/verify) - Certificate verification
3. **Dashboard** (/dashboard) - User certificates
4. **Issue** (/issue) - Issue certificates

### ✅ Features

- Wallet connection (MetaMask)
- Certificate verification
- QR code generation
- Download (PDF, PNG, JSON)
- Social sharing (Twitter, LinkedIn, Facebook, WhatsApp)
- Batch issuance (up to 100 recipients)

---

## 🔧 What You Need to Do Next

### Step 1: Get Contract Addresses from Solidity Developer

Ask your teammate for:

```
CertificateManagement: 0x...
OrganizationRegistry: 0x...
UserIdentity: 0x...
BadgeSystem: 0x... (optional)
```

### Step 2: Update Configuration

Open `src/contracts/config.js` and replace these lines:

```javascript
'polygon-mumbai': {
  CertificateManagement: '0xYOUR_REAL_ADDRESS_HERE',
  OrganizationRegistry: '0xYOUR_REAL_ADDRESS_HERE',
  UserIdentity: '0xYOUR_REAL_ADDRESS_HERE',
  BadgeSystem: '0xYOUR_REAL_ADDRESS_HERE',
}
```

### Step 3: Update ABIs

Open `src/contracts/abis.js` and replace the placeholder ABIs with real ones from:

- `artifacts/contracts/CertificateManagement.sol/CertificateManagement.json`
- `artifacts/contracts/OrganizationRegistry.sol/OrganizationRegistry.json`
- etc.

Copy the `abi` array from each JSON file.

### Step 4: Test Everything

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Register Organization**: (if you need to issue certificates)
3. **Issue Test Certificate**: Go to /issue and create one
4. **Verify Certificate**: Go to /verify and enter the cert ID
5. **Download Certificate**: Try PDF, PNG, JSON downloads
6. **Share Certificate**: Try social media sharing

---

## 🐛 Common Issues & Fixes

### Issue: "Please install MetaMask"

**Solution**: Install MetaMask browser extension

### Issue: "Only verified organizations can issue"

**Solution**: Your wallet needs to be registered as an organization and verified by an admin

### Issue: "Contract not found"

**Solution**: Update contract addresses in `src/contracts/config.js`

### Issue: "Transaction failed"

**Solution**: Make sure you're connected to the correct network (Mumbai testnet)

---

## 📦 Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm run start

# Run linter
npm run lint

# Install dependencies (if needed)
npm install
```

---

## 🔍 File Structure Quick Reference

```
src/
├── app/                    # Pages (Next.js 14 App Router)
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   ├── dashboard/         # Dashboard page
│   ├── issue/             # Issue certificates page
│   └── verify/[[...id]]/  # Verify page
│
├── components/            # Reusable components
│   ├── Navbar.js
│   ├── Footer.js
│   ├── CertificateCard.js
│   ├── CertificateView.js
│   ├── LoadingSpinner.js
│   └── Alert.js
│
├── contexts/              # React contexts
│   ├── Web3Context.js     # Wallet management
│   └── ContractContext.js # Contract instances
│
├── contracts/             # Smart contract integration
│   ├── config.js          # ⚠️ UPDATE THIS with addresses
│   ├── abis.js            # ⚠️ UPDATE THIS with ABIs
│   └── contractsSdk.js    # SDK methods
│
├── utils/                 # Utilities
│   ├── certificate.js     # Certificate functions
│   └── helpers.js         # Helper functions
│
└── styles/
    └── globals.css        # Global styles
```

---

## 🎨 Design System

### Colors

- **Primary**: #1a73e8 (Blue)
- **Secondary**: #34a853 (Green)
- **Accent**: #fbbc04 (Yellow)
- **Danger**: #ea4335 (Red)

### Certificate Types

- Course Completion
- Hackathon Winner
- Hackathon Participant
- Workshop
- Seminar
- Achievement

---

## 🌐 Network Configuration

### Mumbai Testnet (Current Default)

- **Chain ID**: 80001 (0x13881)
- **RPC**: https://rpc-mumbai.maticvigil.com/
- **Explorer**: https://mumbai.polygonscan.com/
- **Faucet**: https://faucet.polygon.technology/

### Get Test MATIC

1. Go to https://faucet.polygon.technology/
2. Select Mumbai
3. Enter your wallet address
4. Click "Submit"
5. Wait 1-2 minutes for tokens

---

## 🎯 Testing Checklist

Before deploying to production:

- [ ] Install MetaMask
- [ ] Get test MATIC from faucet
- [ ] Connect wallet to Mumbai testnet
- [ ] Update contract addresses in config.js
- [ ] Update ABIs in abis.js
- [ ] Test wallet connection
- [ ] Test certificate issuance (as org)
- [ ] Test certificate verification
- [ ] Test certificate download (PDF/PNG/JSON)
- [ ] Test social media sharing
- [ ] Test batch issuance
- [ ] Test on mobile device
- [ ] Test with different wallets
- [ ] Check console for errors

---

## 📱 Mobile Testing

The app is mobile-responsive. Test on:

- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad/Android)

All features work on mobile including:

- Wallet connection
- Certificate viewing
- QR code scanning
- Downloading
- Sharing

---

## 🚀 Deployment Guide

### Deploy to Vercel (Recommended)

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. **Deploy on Vercel**

- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repo
- Add environment variables:
  ```
  NEXT_PUBLIC_NETWORK_NAME=polygon-mumbai
  NEXT_PUBLIC_CHAIN_ID=80001
  ```
- Click "Deploy"

3. **Done!** Your app will be live at `https://your-app.vercel.app`

### Deploy to Netlify

1. Build the project:

```bash
npm run build
```

2. Deploy to Netlify:

- Go to https://netlify.com
- Drag and drop the `out/` folder
- Or connect your GitHub repo

---

## 🆘 Need Help?

1. **Check CHANGES_SUMMARY.md** - Detailed list of all changes
2. **Check PROJECT_SUMMARY.md** - Project overview
3. **Check INTEGRATION_GUIDE.md** - Smart contract integration
4. **Check browser console** - Look for error messages
5. **Check terminal** - Look for build errors

---

## 📊 Status Dashboard

| Feature                  | Status     | Notes                |
| ------------------------ | ---------- | -------------------- |
| Wallet Connection        | ✅ Working | MetaMask supported   |
| Certificate Issuance     | ✅ Working | Single + Batch       |
| Certificate Verification | ✅ Working | Blockchain verified  |
| QR Code Generation       | ✅ Working | High quality codes   |
| PDF Download             | ✅ Working | High resolution      |
| PNG Download             | ✅ Working | High resolution      |
| JSON Download            | ✅ Working | Full data export     |
| Social Sharing           | ✅ Working | 4 platforms          |
| Dashboard                | ✅ Working | Stats + certificates |
| Mobile Responsive        | ✅ Working | All screen sizes     |

---

## 🎉 You're Ready!

The frontend is **100% complete** and ready for integration with smart contracts.

**Next**: Get the contract addresses from your Solidity developer and update the config!

---

**Built with ❤️ using Next.js 14, React 18, Ethers.js v6, and Tailwind CSS**
