# Product Requirements Document (PRD)
## Certificate Verification Platform - Hackathon MVP

**Project**: Certificate Verification Platform - Frontend & Backend (Hackathon Edition)  
**Smart Contracts**: ✅ Already Deployed on Sepolia Testnet  
**Blockchain**: Sepolia Ethereum  
**Version**: 1.0.0 (Hackathon MVP)  
**Date**: October 25, 2025  
**Duration**: 24-48 hours

---

## 1. Project Overview

### What's Already Done ✅
- Smart contracts deployed (CertificateRegistry, InstitutionRegistry, TemplateManager)
- ABIs extracted and available
- Contract addresses documented

### What We're Building (Hackathon MVP)
A working prototype with:
- **Frontend**: Next.js 14 (TypeScript, TailwindCSS, Shadcn UI)
- **Web3**: RainbowKit + Wagmi v2 wallet integration
- **IPFS**: Pinata for certificate and template storage
- **Backend**: Supabase (PostgreSQL database) + Next.js API routes
- **Features**: Issue, verify, manage certificates; QR codes; PDF download

### MVP Scope (No Caching, No Redis, No Complex Backend)
- Single blockchain network (Sepolia)
- Direct smart contract calls (no wrapper APIs)
- Simple CRUD operations
- Basic UI without animations
- Focus on core functionality

### Success Criteria
- ✅ User can connect wallet and issue a certificate
- ✅ Certificate stored on IPFS via Pinata
- ✅ Anyone can verify certificate via public page
- ✅ Certificates stored in Supabase for quick lookup
- ✅ QR code generated for verification
- ✅ Download certificate as PDF
- ✅ Mobile responsive

---

## 2. System Architecture (Simplified for Hackathon)

### Technology Stack

```
Frontend (Client-Side)
├── Framework: Next.js 14 (App Router)
├── Language: TypeScript
├── UI: TailwindCSS + Shadcn UI
├── Forms: React Hook Form + Zod
├── Web3: RainbowKit + Wagmi v2 + Viem
├── State: React Context (no Redux/Zustand)
└── QR/PDF: qrcode.react + jsPDF

Blockchain
├── Network: Sepolia Testnet
├── Contracts: Already deployed
└── RPC: Alchemy/Infura

Storage
├── Decentralized: IPFS via Pinata
├── Database: Supabase (PostgreSQL)
└── No caching layer needed

Backend (Minimal)
├── Framework: Next.js API Routes
├── Database: Supabase PostgreSQL
├── Auth: SIWE (Sign-In with Ethereum)
└── No event indexer needed for MVP
```

### Architecture Diagram

```
┌─────────────┐
│   Browser   │
│   (User)    │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       v              v
┌─────────────┐  ┌──────────────────┐
│  Next.js    │  │  MetaMask/Wallet │
│  Frontend   │◄─┤  (RainbowKit)    │
└──────┬──────┘  └──────────────────┘
       │
       ├──────────┬────────┬──────────┐
       │          │        │          │
       v          v        v          v
  Sepolia    Pinata    Supabase   Next.js
  Contracts   IPFS    PostgreSQL  API Routes
```

---

## 3. Frontend Requirements (MVP Only)

### 3.1 Core Pages

#### **1. Landing Page** (`/`)
- Hero section with CTA button: "Connect Wallet"
- 3 feature cards: Issue, Verify, Manage
- Total certificates counter (live from blockchain)
- Link to verification page

#### **2. Public Verification Page** (`/verify`)
- QR code scanner input OR manual certificate ID input
- Display certificate details:
  - Certificate title
  - Recipient address (with ENS if available)
  - Institution name + logo (from IPFS)
  - Issue date
  - Revocation status (Valid/Revoked)
  - Blockchain proof (tx hash, block number)
- Actions: View on Etherscan, Download PDF, Share link

#### **3. Dashboard Home** (`/dashboard`)
- Connected wallet address display
- Quick stats: Total issued, Active, Revoked
- Recent certificates table (5 latest)
- Button: "Issue New Certificate"

#### **4. Issue Certificate Page** (`/dashboard/issue`)
- Form fields:
  - Recipient address (with ENS support)
  - Certificate title
  - Description
  - Certificate type dropdown (Hackathon, Course, Degree)
  - Template selection (from contract)
- Upload progress indicator
- Transaction status (pending, success, failed)
- Success page with certificate link

#### **5. My Certificates** (`/dashboard/my-certificates`)
- Table/Grid of certificates owned by user
- Columns: ID, Title, Issuer, Date, Status
- Actions: View, Download, Share
- Simple filters (by status, certificate type)

#### **6. Certificate Detail** (`/certificate/[id]`)
- Full certificate display
- Download as PDF (with embedded QR)
- Share on social media
- Blockchain proof section
- View on Etherscan link

---

### 3.2 UI Components (Shadcn UI + Custom)

**Shadcn UI Components to Use**:
- Button
- Card
- Input
- Form
- Dialog
- Select
- Badge
- Table
- Alert
- Skeleton
- Toast (via sonner)

**Custom Components**:
```
components/
├── web3/
│   ├── WalletConnect.tsx          # RainbowKit button
│   ├── AddressDisplay.tsx         # Truncated address
│   └── TransactionStatus.tsx      # Tx status indicator
├── certificate/
│   ├── CertificateCard.tsx
│   ├── CertificateForm.tsx        # Issue form
│   ├── CertificatePDF.tsx         # PDF generator
│   └── CertificatePreview.tsx
├── qr/
│   ├── QRScanner.tsx              # Camera-based scanning
│   ├── QRCodeDisplay.tsx
│   └── QRInput.tsx                # Manual input
├── ipfs/
│   └── IPFSUploader.tsx           # Upload with progress
└── shared/
    ├── Header.tsx
    ├── Footer.tsx
    └── Sidebar.tsx
```

---

### 3.3 Web3 Integration

**Wagmi Configuration** (`lib/wagmi.ts`):
```typescript
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const { chains, publicClient } = configureChains(
  [sepolia],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY! })]
);

const { connectors } = getDefaultWallets({
  appName: 'Certificate Platform',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  chains
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export { chains };
```

**Contract Hooks** (`lib/hooks/useContracts.ts`):
```typescript
import { useContractWrite, useContractRead, usePrepareContractWrite } from 'wagmi';
import CertificateRegistryABI from '../abi/CertificateRegistry.json';

const CERT_ADDRESS = process.env.NEXT_PUBLIC_CERTIFICATE_REGISTRY_ADDRESS;

// Issue certificate
export function useIssueCertificate() {
  const { config } = usePrepareContractWrite({
    address: CERT_ADDRESS,
    abi: CertificateRegistryABI,
    functionName: 'issueCertificate'
  });
  return useContractWrite(config);
}

// Verify certificate
export function useVerifyCertificate(certificateId: number) {
  return useContractRead({
    address: CERT_ADDRESS,
    abi: CertificateRegistryABI,
    functionName: 'verifyCertificate',
    args: [certificateId],
    watch: true
  });
}

// Get recipient certificates
export function useRecipientCertificates(address: string) {
  return useContractRead({
    address: CERT_ADDRESS,
    abi: CertificateRegistryABI,
    functionName: 'getCertificatesByRecipient',
    args: [address],
    enabled: !!address
  });
}

// Revoke certificate
export function useRevokeCertificate() {
  const { config } = usePrepareContractWrite({
    address: CERT_ADDRESS,
    abi: CertificateRegistryABI,
    functionName: 'revokeCertificate'
  });
  return useContractWrite(config);
}
```

---

## 4. IPFS Integration (Pinata)

### 4.1 Setup

**Environment Variables**:
```bash
NEXT_PUBLIC_PINATA_API_KEY=your_key
PINATA_API_SECRET=your_secret
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

**Pinata Functions** (`lib/ipfs.ts`):
```typescript
const PINATA_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_API_SECRET;
const GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

// Upload file to IPFS
export async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: PINATA_KEY,
      pinata_secret_api_key: PINATA_SECRET
    },
    body: formData
  });

  const data = await res.json();
  return data.IpfsHash; // Return CID
}

// Upload JSON metadata
export async function uploadMetadataToIPFS(metadata: object): Promise<string> {
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: PINATA_KEY,
      pinata_secret_api_key: PINATA_SECRET
    },
    body: JSON.stringify(metadata)
  });

  const data = await res.json();
  return data.IpfsHash;
}

// Get IPFS gateway URL
export function getIPFSGatewayURL(cid: string): string {
  return `${GATEWAY}${cid}`;
}

// Fetch from IPFS
export async function fetchFromIPFS(cid: string): Promise<any> {
  const res = await fetch(getIPFSGatewayURL(cid));
  return res.json();
}
```

### 4.2 Certificate Metadata Schema

```json
{
  "name": "Blockchain Hackathon Winner",
  "description": "Outstanding performance",
  "image": "ipfs://QmXXX",
  "attributes": [
    { "trait_type": "Certificate Type", "value": "Hackathon" },
    { "trait_type": "Institution", "value": "Tech Uni" },
    { "trait_type": "Recipient", "value": "John Doe" },
    { "trait_type": "Issue Date", "value": "2025-10-25" }
  ],
  "issuer": {
    "name": "Tech University",
    "address": "0x...",
    "logo": "ipfs://QmXXX"
  },
  "certificateId": 1,
  "transactionHash": "0x...",
  "blockNumber": 12345
}
```

---

## 5. Supabase Database (PostgreSQL)

### 5.1 Database Schema

**Tables to Create**:

1. **certificates**
```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id INTEGER UNIQUE NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  ipfs_hash VARCHAR(255) NOT NULL,
  metadata JSONB NOT NULL,
  certificate_type VARCHAR(100),
  tx_hash VARCHAR(255),
  block_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE,
  
  INDEX (issuer),
  INDEX (recipient),
  INDEX (certificate_id)
);
```

2. **institutions**
```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo_ipfs_hash VARCHAR(255),
  contact_info TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX (address)
);
```

3. **templates**
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id INTEGER UNIQUE,
  creator VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  category VARCHAR(100),
  template_ipfs_hash VARCHAR(255),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX (creator)
);
```

4. **verifications**
```sql
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id INTEGER NOT NULL,
  verified_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(50),
  
  INDEX (certificate_id)
);
```

### 5.2 Supabase Client Setup

**`lib/supabase.ts`**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
export async function saveCertificateToDatabase(certData: any) {
  const { data, error } = await supabase
    .from('certificates')
    .insert([{
      certificate_id: certData.certificateId,
      issuer: certData.issuer,
      recipient: certData.recipient,
      ipfs_hash: certData.ipfsHash,
      metadata: certData.metadata,
      certificate_type: certData.certificateType,
      tx_hash: certData.txHash,
      block_number: certData.blockNumber
    }]);

  if (error) throw error;
  return data;
}

export async function getCertificateFromDatabase(certificateId: number) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_id', certificateId)
    .single();

  if (error) throw error;
  return data;
}

export async function getCertificatesByRecipient(recipientAddress: string) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('recipient', recipientAddress)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCertificatesByIssuer(issuerAddress: string) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('issuer', issuerAddress)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function logVerification(certificateId: number) {
  const { error } = await supabase
    .from('verifications')
    .insert([{
      certificate_id: certificateId,
      ip_address: '' // Get from request if needed
    }]);

  if (error) console.error('Verification log error:', error);
}
```

---

## 6. Backend (Next.js API Routes - Minimal)

### 6.1 API Endpoints

All endpoints use Next.js API routes (no separate Express server needed).

**`app/api/certificates/issue/route.ts`** - Issue certificate
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadMetadataToIPFS } from '@/lib/ipfs';
import { saveCertificateToDatabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipient, title, description, certificateType, issuer, txHash, blockNumber } = body;

    // Upload metadata to IPFS
    const metadata = {
      name: title,
      description,
      attributes: [
        { trait_type: 'Certificate Type', value: certificateType },
        { trait_type: 'Recipient', value: recipient },
        { trait_type: 'Issuer', value: issuer }
      ]
    };

    const ipfsHash = await uploadMetadataToIPFS(metadata);

    // Save to Supabase
    const cert = await saveCertificateToDatabase({
      certificateId: body.certificateId,
      issuer,
      recipient,
      ipfsHash,
      metadata,
      certificateType,
      txHash,
      blockNumber
    });

    return NextResponse.json({ success: true, data: cert });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**`app/api/certificates/[id]/route.ts`** - Fetch certificate
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCertificateFromDatabase, logVerification } from '@/lib/supabase';
import { fetchFromIPFS } from '@/lib/ipfs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certificateId = parseInt(params.id);
    
    // Fetch from database
    const cert = await getCertificateFromDatabase(certificateId);
    
    // Fetch metadata from IPFS
    const ipfsData = await fetchFromIPFS(cert.ipfs_hash);

    // Log verification
    await logVerification(certificateId);

    return NextResponse.json({
      ...cert,
      ipfsData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**`app/api/certificates/recipient/[address]/route.ts`** - Get certificates by recipient
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCertificatesByRecipient } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const certs = await getCertificatesByRecipient(params.address);
    return NextResponse.json(certs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 7. Authentication (SIWE - Sign-In with Ethereum)

### 7.1 NextAuth Configuration

**`app/api/auth/[...nextauth]/route.ts`**:
```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' }
      },
      async authorize(credentials: any) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials.message));
          const result = await siwe.verify({ signature: credentials.signature });
          
          if (result.success) {
            return { id: siwe.address };
          }
          return null;
        } catch (e) {
          return null;
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.address = user.id;
      return token;
    },
    async session({ session, token }: any) {
      session.user.address = token.address;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## 8. QR Code & PDF Generation

### 8.1 QR Code Component

**`components/qr/QRCodeDisplay.tsx`**:
```typescript
import QRCode from 'qrcode.react';

export function QRCodeDisplay({ certificateId }: { certificateId: number }) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?id=${certificateId}`;

  return (
    <div className="flex flex-col items-center">
      <QRCode 
        value={verifyUrl} 
        size={256} 
        level="H" 
        includeMargin={true}
      />
      <p className="text-sm text-gray-600 mt-2">Scan to verify</p>
    </div>
  );
}
```

### 8.2 PDF Generation

**`lib/pdf/generatePDF.ts`**:
```typescript
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export async function generateCertificatePDF(
  title: string,
  recipient: string,
  issuer: string,
  date: string,
  certificateId: number
) {
  const doc = new jsPDF();
  
  // Background
  doc.setFillColor(240, 248, 255);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

  // Title
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 40, { align: 'center' });

  // Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Awarded to: ${recipient}`, 20, 80);
  doc.text(`Issued by: ${issuer}`, 20, 100);
  doc.text(`Date: ${date}`, 20, 120);

  // QR Code
  const qrDataUrl = await QRCode.toDataURL(
    `${process.env.NEXT_PUBLIC_APP_URL}/verify?id=${certificateId}`
  );
  doc.addImage(qrDataUrl, 'PNG', 150, 120, 40, 40);

  // Certificate ID
  doc.setFontSize(10);
  doc.text(`Certificate ID: ${certificateId}`, 20, 260);

  return doc;
}
```

### 8.3 PDF Download Button

**`components/certificate/PDFDownloadButton.tsx`**:
```typescript
import { generateCertificatePDF } from '@/lib/pdf/generatePDF';

export function PDFDownloadButton({ certificate }: any) {
  const handleDownload = async () => {
    const doc = await generateCertificatePDF(
      certificate.name,
      certificate.recipient,
      certificate.issuer,
      new Date(certificate.created_at).toLocaleDateString(),
      certificate.certificate_id
    );
    
    doc.save(`certificate-${certificate.certificate_id}.pdf`);
  };

  return (
    <button 
      onClick={handleDownload}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Download PDF
    </button>
  );
}
```

---

## 9. File Structure

```
certificate-platform/
├── .env.local                      # Environment variables
├── .gitignore
├── next.config.js
├── tsconfig.json
├── package.json
├── tailwind.config.js
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing
│   ├── providers.tsx               # Web3 + Auth providers
│   ├── verify/
│   │   ├── page.tsx                # Public verification
│   │   └── [id]/
│   ├── certificate/
│   │   └── [id]/
│   │       └── page.tsx            # Certificate detail
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Dashboard home
│   │   ├── issue/
│   │   │   └── page.tsx            # Issue certificate
│   │   └── my-certificates/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       ├── certificates/
│       │   ├── route.ts
│       │   ├── [id]/
│       │   │   └── route.ts
│       │   └── recipient/
│       │       └── [address]/
│       │           └── route.ts
│       └── institutions/
│           └── route.ts
│
├── components/
│   ├── ui/                         # Shadcn UI
│   ├── web3/
│   │   ├── WalletConnect.tsx
│   │   ├── AddressDisplay.tsx
│   │   └── TransactionStatus.tsx
│   ├── certificate/
│   │   ├── CertificateForm.tsx
│   │   ├── CertificateCard.tsx
│   │   ├── CertificatePDF.tsx
│   │   └── CertificateDetail.tsx
│   ├── qr/
│   │   ├── QRScanner.tsx
│   │   ├── QRCodeDisplay.tsx
│   │   └── QRInput.tsx
│   ├── ipfs/
│   │   └── IPFSUploader.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
│
├── lib/
│   ├── wagmi.ts
│   ├── ipfs.ts
│   ├── supabase.ts
│   ├── utils.ts
│   ├── hooks/
│   │   ├── useContracts.ts
│   │   └── useAuth.ts
│   ├── abi/
│   │   ├── CertificateRegistry.json
│   │   ├── InstitutionRegistry.json
│   │   └── TemplateManager.json
│   └── pdf/
│       └── generatePDF.ts
│
├── types/
│   └── index.ts
│
└── README.md
```

---

## 10. Environment Variables

**`.env.local`**:
```bash
# Blockchain
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Contract Addresses
NEXT_PUBLIC_CERTIFICATE_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_TEMPLATE_MANAGER_ADDRESS=0x...

# Web3 Wallet
NEXT_PUBLIC_WALLETCONNECT_ID=your_walletconnect_project_id

# IPFS (Pinata)
NEXT_PUBLIC_PINATA_API_KEY=your_api_key
PINATA_API_SECRET=your_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 11. Implementation Timeline (24-48 Hours)

### Phase 1: Setup (Hour 0-4)
- [ ] Create Next.js 14 project
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Configure Wagmi + RainbowKit
- [ ] Set up Supabase project and tables
- [ ] Create contract ABIs in lib/abi/

### Phase 2: Web3 & Auth (Hour 4-8)
- [ ] Implement Wagmi configuration
- [ ] Add RainbowKit wallet button
- [ ] Set up NextAuth + SIWE
- [ ] Test wallet connection
- [ ] Create basic layout with Header

### Phase 3: Core Features (Hour 8-16)
- [ ] Build landing page
- [ ] Build dashboard home page
- [ ] Build issue certificate page
  - Form input
  - IPFS upload to Pinata
  - Smart contract call
  - Save to Supabase
  - Show confirmation
- [ ] Build verification page
  - Fetch from blockchain or Supabase
  - Fetch metadata from IPFS
  - Display details

### Phase 4: Certificates List & Detail (Hour 16-20)
- [ ] Build "My Certificates" page
- [ ] Build certificate detail page
- [ ] Add QR code display
- [ ] Add PDF download
- [ ] Add share functionality

### Phase 5: Polish (Hour 20-24)
- [ ] Mobile responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] Test all user flows
- [ ] Deploy to Vercel

### Phase 6: Final Testing (Hour 24+)
- [ ] Test certificate issuance end-to-end
- [ ] Test verification
- [ ] Test PDF download
- [ ] Test mobile
- [ ] Test with multiple wallets

---

## 12. Simplified Database Queries

**Supabase Queries for Frontend**:

```typescript
// Save certificate after mint
const { data } = await supabase
  .from('certificates')
  .insert([{
    certificate_id: certId,
    issuer: userAddress,
    recipient: recipientAddress,
    ipfs_hash: ipfsHash,
    metadata: metadata,
    tx_hash: txHash,
    block_number: blockNumber
  }])
  .select();

// Get certificate for verification
const { data } = await supabase
  .from('certificates')
  .select('*')
  .eq('certificate_id', id)
  .single();

// Get user's certificates
const { data } = await supabase
  .from('certificates')
  .select('*')
  .eq('recipient', userAddress)
  .order('created_at', { ascending: false });

// Get issued certificates
const { data } = await supabase
  .from('certificates')
  .select('*')
  .eq('issuer', userAddress)
  .order('created_at', { ascending: false });

// Log verification
await supabase
  .from('verifications')
  .insert([{ certificate_id: id }]);
```

---

## 13. Key Implementation Notes

### No Caching or Complex Backend
- Direct smart contract calls from frontend
- No separate API server needed
- Use Next.js API routes only for CRUD operations
- No event indexer (data fetched on-demand)

### Pinata IPFS Integration
- Use Pinata API keys directly in Next.js API routes
- Upload certificate metadata as JSON
- Return IPFS CID to frontend
- Store CID in both smart contract and Supabase

### Supabase Database
- Simple PostgreSQL tables
- Quick lookups for verification
- Log user actions (verifications)
- No complex joins or aggregations

### User Flow
1. **Issue Certificate**:
   - User connects wallet
   - Fills form
   - Metadata uploaded to IPFS (Pinata)
   - Smart contract called (mint certificate)
   - Data saved to Supabase
   - QR code generated
   - PDF downloadable

2. **Verify Certificate**:
   - User scans QR or enters certificate ID
   - Fetch from Supabase (fast)
   - Fetch IPFS metadata
   - Display with blockchain proof
   - Log verification

3. **View My Certificates**:
   - Query Supabase by recipient address
   - Display in table/grid
   - Link to detail page

---

## 14. Deployment (Hackathon Submission)

### Frontend Deployment (Vercel)
```bash
npm run build
vercel --prod
```

### Database (Supabase Cloud)
- Already provided by Supabase
- No deployment needed

### IPFS (Pinata Cloud)
- Already provided by Pinata
- No deployment needed

### Smart Contracts
- Already deployed on Sepolia

### Requirements for Submission
- [ ] Live demo URL (Vercel)
- [ ] GitHub repository
- [ ] README with setup instructions
- [ ] .env.example with all required variables
- [ ] Working wallet connection
- [ ] Certificate issuance working
- [ ] Certificate verification working
- [ ] QR code generation
- [ ] PDF download

---

## 15. Testing Checklist

### Core Functionality
- [ ] Wallet connection works (MetaMask, WalletConnect)
- [ ] Certificate issuance completes successfully
- [ ] IPFS upload to Pinata works
- [ ] Smart contract mint succeeds
- [ ] Data saved to Supabase
- [ ] Certificate appears in "My Certificates"
- [ ] Verification page displays certificate correctly
- [ ] QR code generates and links to verification page
- [ ] PDF downloads with QR code embedded
- [ ] Share button copies link to clipboard

### Edge Cases
- [ ] Invalid certificate ID shows error
- [ ] Revoked certificate shows "Revoked" status
- [ ] ENS name resolves if available
- [ ] Mobile responsive design
- [ ] Transaction failures handled gracefully
- [ ] IPFS upload timeout handled

---

## 16. Hackathon Submission Checklist

- [ ] All pages working and accessible
- [ ] Wallet connection successful
- [ ] Certificate issuance works
- [ ] Certificate verification works
- [ ] QR code functional
- [ ] PDF download working
- [ ] Responsive mobile design
- [ ] No console errors
- [ ] Environment variables documented
- [ ] GitHub repo with clean code
- [ ] README with setup instructions
- [ ] Live demo URL provided
- [ ] Tested on Sepolia testnet
- [ ] All features working as described

---

**END OF HACKATHON MVP PRD**

This is a simplified, focused PRD for a 24-48 hour hackathon. Focus on getting the core features working rather than building a complex system. Good luck! 🚀
