# KK Verifier - Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- MetaMask or any Web3 wallet browser extension
- Your teammate's deployed Solidity smart contracts

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your deployed contract addresses:

```env
NEXT_PUBLIC_NETWORK_NAME=polygon-mumbai
NEXT_PUBLIC_CHAIN_ID=80001

# Replace these with actual deployed contract addresses from your teammate
NEXT_PUBLIC_CONTRACT_CERTIFICATE=0xYourCertificateContractAddress
NEXT_PUBLIC_CONTRACT_ORGANIZATION=0xYourOrganizationContractAddress
NEXT_PUBLIC_CONTRACT_USER_IDENTITY=0xYourUserIdentityContractAddress
NEXT_PUBLIC_CONTRACT_BADGE_SYSTEM=0xYourBadgeSystemContractAddress
```

### 3. Update Contract ABIs

Once your teammate provides the compiled Solidity contracts:

1. Get the ABI (Application Binary Interface) from the compiled contracts
2. Update `src/contracts/abis.js` with the actual function signatures
3. Ensure the function names match your Solidity contract functions

### 4. Update Contract Addresses

Edit `src/contracts/config.js`:

```javascript
export const CONTRACTS = {
  "polygon-mumbai": {
    CertificateManagement: "0xYourActualAddress",
    OrganizationRegistry: "0xYourActualAddress",
    // ... etc
  },
};
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
npm run start
```

## 🔗 Integration with Smart Contracts

### Getting Contract ABIs

After your teammate compiles the Solidity contracts with Hardhat:

```bash
# They will run:
npx hardhat compile

# This creates: artifacts/contracts/CertificateManagement.sol/CertificateManagement.json
```

Extract the `abi` field from the JSON file and update the corresponding arrays in `src/contracts/abis.js`.

### Function Mapping

Make sure your Solidity contract functions match these expected signatures:

**CertificateManagement.sol:**

```solidity
function issueCertificate(
    address recipient,
    string memory certType,
    string memory certName,
    string memory courseDetails,
    string memory gradeInfo,
    uint256 issueDate,
    uint256 expiryDate
) external returns (uint256 certId)

function verifyCertificate(uint256 certId)
    external view returns (bool isValid, bytes32 certHash, ...)

function getUserCertificates(address user)
    external view returns (uint256[] memory)
```

**OrganizationRegistry.sol:**

```solidity
function registerOrganization(
    string memory name,
    string memory orgType,
    string memory description,
    string memory websiteUrl
) external returns (bool)

function isVerifiedOrganization(address org)
    external view returns (bool)
```

## 🎨 Customization

### Update Branding

1. **Colors**: Edit `tailwind.config.js` to change primary, secondary colors
2. **Logo**: Replace the icon in `src/components/Navbar.js`
3. **Styles**: Modify `src/styles/globals.css` for global styles

### Certificate Template

To customize the certificate design, edit `src/components/CertificateView.js`:

- Change colors, gradients
- Modify layout and typography
- Add your organization's logo

## 📱 Features Included

✅ **Wallet Connection** - MetaMask integration with Ethers.js v6
✅ **Certificate Issuance** - Single and batch certificate issuance
✅ **Certificate Verification** - Instant blockchain verification with QR codes
✅ **User Dashboard** - View all certificates and achievements
✅ **Download Certificates** - Export as PDF or PNG
✅ **Share Certificates** - Social media sharing integration
✅ **Organization Management** - Multi-institutional support
✅ **Responsive Design** - Mobile-friendly interface
✅ **Error Handling** - Comprehensive error messages

## 🔧 Troubleshooting

### "Contract not found" Error

- Ensure contract addresses in `.env.local` are correct
- Verify you're connected to the right network (Mumbai testnet)
- Check that contracts are actually deployed

### "Function not found" Error

- Update ABIs in `src/contracts/abis.js` to match your Solidity functions
- Ensure function signatures match exactly

### Wallet Connection Issues

- Make sure MetaMask is installed
- Switch to Polygon Mumbai testnet in MetaMask
- Add Mumbai testnet if not present (the app will prompt)

### Transaction Failures

- Ensure you have enough MATIC for gas fees
- Check if your account has the required permissions
- View transaction on Polygonscan for detailed error

## 📚 Project Structure

```
kkverifier/
├── src/
│   ├── app/              # Next.js 14 App Router pages
│   │   ├── page.js       # Home page
│   │   ├── dashboard/    # User dashboard
│   │   ├── issue/        # Issue certificate page
│   │   └── verify/       # Verify certificate page
│   ├── components/       # Reusable React components
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── CertificateCard.js
│   │   └── CertificateView.js
│   ├── contexts/         # React Context providers
│   │   ├── Web3Context.js      # Wallet connection
│   │   └── ContractContext.js  # Contract instances
│   ├── contracts/        # Smart contract integration
│   │   ├── config.js           # Contract addresses & networks
│   │   ├── abis.js             # Contract ABIs
│   │   └── contractsSdk.js     # Contract interaction SDK
│   ├── utils/            # Utility functions
│   │   ├── helpers.js          # General helpers
│   │   └── certificate.js      # Certificate-specific utils
│   └── styles/
│       └── globals.css         # Global styles
├── public/               # Static assets
├── .env.local           # Environment variables (create this)
└── package.json
```

## 🤝 Working with Your Teammate

### What You Need From Them:

1. **Deployed Contract Addresses** on Polygon Mumbai
2. **Contract ABIs** (from compiled Solidity files)
3. **Function Signatures** (confirm they match the expected ones)
4. **Network Details** (chain ID, RPC URL if custom)

### What You Provide Them:

1. **Frontend URLs** for testing (e.g., http://localhost:3000)
2. **Expected Function Behavior** (what the frontend expects)
3. **Error Feedback** (any issues you encounter during integration)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables to Set in Vercel:

- All variables from `.env.local`
- Set `NEXT_PUBLIC_APP_URL` to your Vercel URL

## 📞 Support

For issues or questions:

- Check the code comments
- Review the smart contract integration in `src/contracts/`
- Test contract functions directly with Hardhat console first
- Verify transactions on Polygonscan

## 🎉 You're All Set!

The frontend is now ready to integrate with your teammate's Solidity smart contracts. Just update the contract addresses and ABIs, and you're good to go!
