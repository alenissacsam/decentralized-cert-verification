# Complete Frontend Rebuild - Migration Plan

## 📋 PRD Analysis Summary

### Current State (JavaScript + Ethers.js)

- **Tech Stack**: Next.js 14.2.33, JavaScript, Ethers.js v6.8.0, MetaMask only
- **Network**: Polygon Mumbai/Mainnet
- **Pages**: 3 pages (homepage, organizer, user)
- **Styling**: ✅ Supernatural CSS (1,400 lines) - **KEEP THIS**
- **Backend**: None
- **Database**: None
- **IPFS**: None

### Target State (TypeScript + Wagmi v2)

- **Tech Stack**: Next.js 14, TypeScript, Wagmi v2, RainbowKit, Viem
- **Network**: Sepolia Testnet only
- **Pages**: 6 core pages (landing, verify, dashboard, issue, my-certificates, certificate detail)
- **Styling**: ✅ Keep Supernatural CSS + Add Shadcn UI
- **Backend**: Supabase PostgreSQL
- **Storage**: Pinata IPFS
- **Features**: QR codes, PDF generation, SIWE auth

---

## 🎯 Key Changes Required

### 1. Language Migration

- [ ] Convert all `.js` files to `.tsx` files
- [ ] Add TypeScript types throughout
- [ ] Create `types/index.ts` for shared types
- [ ] Update `tsconfig.json` settings

### 2. Web3 Stack Replacement

- [ ] Remove Ethers.js
- [ ] Install RainbowKit + Wagmi v2 + Viem
- [ ] Replace `Web3Context.js` with Wagmi config
- [ ] Update all contract interactions to use Wagmi hooks
- [ ] Change network from Polygon to Sepolia

### 3. Page Restructure

| Current                 | PRD Target                               | Action                                          |
| ----------------------- | ---------------------------------------- | ----------------------------------------------- |
| `app/page.js`           | `app/page.tsx`                           | Convert to TypeScript, redesign as Landing page |
| `app/organizer/page.js` | `app/dashboard/issue/page.tsx`           | Move + Convert + Rename                         |
| `app/user/page.js`      | `app/dashboard/my-certificates/page.tsx` | Move + Convert + Rename                         |
| ❌ Missing              | `app/verify/page.tsx`                    | Create new (public verification)                |
| ❌ Missing              | `app/dashboard/page.tsx`                 | Create new (dashboard home)                     |
| ❌ Missing              | `app/certificate/[id]/page.tsx`          | Create new (certificate detail)                 |

### 4. New Components to Create

- [ ] `components/ui/*` - Shadcn UI components
- [ ] `components/web3/WalletConnect.tsx` - RainbowKit button
- [ ] `components/certificate/CertificateForm.tsx` - Issue form
- [ ] `components/certificate/CertificateCard.tsx` - Update existing
- [ ] `components/qr/QRCodeDisplay.tsx` - QR code generator
- [ ] `components/qr/QRScanner.tsx` - QR code scanner
- [ ] `lib/pdf/generatePDF.ts` - PDF generation

### 5. Backend Integration

- [ ] Install Supabase client
- [ ] Create `lib/supabase.ts`
- [ ] Create API routes: `app/api/certificates/route.ts`
- [ ] Create API routes: `app/api/certificates/[id]/route.ts`
- [ ] Create API routes: `app/api/auth/[...nextauth]/route.ts`

### 6. IPFS Integration

- [ ] Install Pinata SDK
- [ ] Create `lib/ipfs.ts`
- [ ] Add IPFS upload functionality

---

## 📦 Dependencies to Install

```json
{
  "dependencies": {
    "@rainbow-me/rainbowkit": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "wagmi": "^2.0.0",
    "viem": "^2.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "next-auth": "^4.24.0",
    "siwe": "^2.0.0",
    "qrcode.react": "^3.1.0",
    "jspdf": "^2.5.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.22.0",
    "@pinata/sdk": "^2.1.0",
    "qrcode": "^1.5.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## 🔄 File-by-File Migration Plan

### Phase 1: TypeScript Setup (15 min)

1. Install TypeScript and types
2. Create `tsconfig.json` (PRD specifies strict mode)
3. Create `types/index.ts` with all interfaces
4. Convert `next.config.js` if needed

### Phase 2: Web3 Setup (30 min)

1. Install RainbowKit + Wagmi v2
2. Create `lib/wagmi.ts` with Sepolia config
3. Create `app/providers.tsx` with RainbowKit + Wagmi providers
4. Update `app/layout.tsx` to use providers
5. Delete old `contexts/Web3Context.js`

### Phase 3: Contract Setup (15 min)

1. Create `lib/abi/CertificateRegistry.json`
2. Create `lib/abi/InstitutionRegistry.json`
3. Create `lib/abi/TemplateManager.json`
4. Update `contracts/config.js` → `lib/contracts.ts` with Sepolia addresses
5. Create `lib/hooks/useContracts.ts` with Wagmi hooks

### Phase 4: Backend Setup (20 min)

1. Install Supabase + NextAuth
2. Create `lib/supabase.ts`
3. Create `.env.local` with all environment variables
4. Create API routes folder structure

### Phase 5: Page Migration (60 min)

1. Convert `app/layout.js` → `app/layout.tsx`
2. Rebuild `app/page.tsx` (Landing page - PRD design)
3. Create `app/verify/page.tsx` (Public verification)
4. Create `app/dashboard/layout.tsx` (Protected layout)
5. Create `app/dashboard/page.tsx` (Dashboard home)
6. Migrate `app/organizer/page.js` → `app/dashboard/issue/page.tsx`
7. Migrate `app/user/page.js` → `app/dashboard/my-certificates/page.tsx`
8. Create `app/certificate/[id]/page.tsx` (Certificate detail)

### Phase 6: Components (45 min)

1. Convert `components/Navbar.js` → `components/layout/Header.tsx`
2. Convert `components/Footer.js` → `components/layout/Footer.tsx`
3. Convert `components/CertificateCard.js` → `components/certificate/CertificateCard.tsx`
4. Convert `components/CertificateView.js` → `components/certificate/CertificateDetail.tsx`
5. Create new components (WalletConnect, QRCodeDisplay, etc.)

### Phase 7: Features (40 min)

1. Create `lib/ipfs.ts` (Pinata integration)
2. Create `lib/pdf/generatePDF.ts`
3. Create QR code components
4. Create certificate form with validation

### Phase 8: API Routes (30 min)

1. Create `app/api/certificates/route.ts`
2. Create `app/api/certificates/[id]/route.ts`
3. Create `app/api/auth/[...nextauth]/route.ts`

---

## 🎨 Styling Strategy

### KEEP EXISTING:

✅ `src/styles/globals.css` - All 1,400 lines of supernatural CSS
✅ Tricolor theme (#FF9933, #138808, #000080)
✅ 30+ animations
✅ 15+ 3D effects
✅ Indian cultural elements
✅ Tech/hackathon elements

### ADD NEW:

- Shadcn UI components (button, form, card, dialog)
- RainbowKit default styles
- Component-specific Tailwind classes

### APPLY SUPERNATURAL CSS TO:

- Landing page hero section
- Dashboard cards
- Certificate cards
- Verification page
- All interactive elements

---

## 🚀 Execution Order

### Step 1: Dependencies (DO THIS FIRST)

```bash
npm install typescript @types/react @types/node
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
npm install @supabase/supabase-js
npm install next-auth siwe
npm install qrcode.react qrcode jspdf
npm install react-hook-form zod
npm install @pinata/sdk
```

### Step 2: Config Files

1. Create `tsconfig.json`
2. Update `next.config.js`
3. Create `.env.local`

### Step 3: Core Setup

1. Create `types/index.ts`
2. Create `lib/wagmi.ts`
3. Create `app/providers.tsx`
4. Update `app/layout.tsx`

### Step 4: Pages (In Order)

1. Landing → `app/page.tsx`
2. Verify → `app/verify/page.tsx`
3. Dashboard → `app/dashboard/page.tsx`
4. Issue → `app/dashboard/issue/page.tsx`
5. My Certificates → `app/dashboard/my-certificates/page.tsx`
6. Certificate Detail → `app/certificate/[id]/page.tsx`

### Step 5: Test & Fix

1. Test wallet connection
2. Test each page navigation
3. Fix TypeScript errors
4. Test supernatural CSS applies correctly

---

## ⚠️ Critical Notes

1. **DO NOT TOUCH** `src/styles/globals.css` - Keep all supernatural CSS
2. **Network**: Change all contract addresses to Sepolia
3. **TypeScript**: Use strict mode as PRD specifies
4. **Responsive**: All pages must be mobile-responsive
5. **Error Handling**: Add loading states and error boundaries
6. **PRD Compliance**: Follow PRD file structure exactly

---

## 📊 Progress Tracker

### Phase 1: Setup ⏳

- [ ] TypeScript installed
- [ ] Dependencies installed
- [ ] Config files created
- [ ] Environment variables set

### Phase 2: Core ⏳

- [ ] Wagmi configured
- [ ] Providers set up
- [ ] Layout updated
- [ ] Types defined

### Phase 3: Pages ⏳

- [ ] Landing page
- [ ] Verify page
- [ ] Dashboard page
- [ ] Issue page
- [ ] My Certificates page
- [ ] Certificate Detail page

### Phase 4: Features ⏳

- [ ] Wallet connection
- [ ] Certificate issuance
- [ ] IPFS upload
- [ ] QR codes
- [ ] PDF download
- [ ] Supabase queries

### Phase 5: Polish ⏳

- [ ] Supernatural CSS applied
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Error handling
- [ ] All tests passing

---

## 🎯 Success Criteria

- ✅ All 6 pages working
- ✅ TypeScript throughout (no `.js` files)
- ✅ Wagmi v2 + RainbowKit working
- ✅ Sepolia network configured
- ✅ Supernatural CSS maintained
- ✅ Indian tricolor theme intact
- ✅ Mobile responsive
- ✅ No console errors
- ✅ PRD structure followed exactly

---

**Estimated Total Time**: 4-6 hours for complete rebuild

**Start Time**: Now
**Target Completion**: Same day

Let's build this! 🚀
