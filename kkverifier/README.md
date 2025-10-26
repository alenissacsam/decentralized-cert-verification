# KK Verifier - Blockchain Certificate Verification Platform

A decentralized certificate verification platform built with Next.js and Ethereum/Polygon blockchain.

## Features

- 🎓 **Certificate Issuance**: Issue tamper-proof certificates on blockchain
- ✅ **Instant Verification**: Verify certificates via QR code scanning
- 📊 **User Dashboard**: Manage all your certificates in one place
- 🏢 **Organization Registry**: Multi-institutional support
- 🎨 **Template Designer**: Create custom certificate templates
- 🔐 **Blockchain Security**: Tamper-proof storage with hash verification
- 📱 **Mobile Friendly**: Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Ethers.js v6
- **QR Codes**: qrcode, react-qr-scanner
- **PDF Generation**: jspdf, html2canvas

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or any Web3 wallet
- Access to deployed smart contracts

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_NAME=polygon-mumbai
NEXT_PUBLIC_CHAIN_ID=80001
```

## Project Structure

```
kkverifier/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Next.js pages
│   ├── contracts/        # Smart contract ABIs & SDK
│   ├── utils/            # Helper functions
│   ├── styles/           # Global styles
│   └── contexts/         # React contexts
├── public/               # Static assets
└── package.json
```

## Usage

### For Certificate Issuers

1. Connect your wallet
2. Register as an organization
3. Get verified by admin
4. Issue certificates to recipients

### For Certificate Recipients

1. Connect your wallet
2. View your certificates in dashboard
3. Download or share certificates
4. Generate QR codes for verification

### For Verifiers

1. Scan QR code or enter certificate ID
2. Instantly verify certificate authenticity
3. View certificate details

## Building for Production

```bash
npm run build
npm run start
```

## License

MIT License

## Contact

For questions or support, please open an issue.
