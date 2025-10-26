# 🎯 FINAL ALIGNMENT PLAN - Smart Contract to Frontend

**Based on:** https://github.com/alenissacsam/decentralized-cert-verification  
**Date:** October 26, 2025  
**Status:** Ready for Complete Alignment

---

## ✅ WHAT'S ALREADY CORRECT

### **1. Contract Addresses** ✅

```typescript
// src/contracts/config.js
CertificateRegistry: 0xe38c32fc0290ceb5189d4df130c37d0c82ce876f;
InstitutionRegistry: 0xd4c4cc66c7ff23260287dc3a3985aa5f6ba7b059;
TemplateManager: 0x5d61562121d28b772e4f782dc12f61ffcbd861ad;
NameRegistry: 0xad96f1220a5ead242ed3ec774a9fb59e157d8520;
```

**Status:** ✅ Already updated in .env.local and config.js

### **2. Core Hooks** ✅

- ✅ `useIssueCertificate()`
- ✅ `useIssueCertificateWithTemplate()`
- ✅ `useBatchIssueCertificates()`
- ✅ `useBatchIssueCertificatesWithTemplates()`
- ✅ `useCertificate(id)`
- ✅ `useGetCertificatesByRecipient(address)`
- ✅ `useGetCertificatesByInstitution(address)`
- ✅ `useRevokeCertificate()`
- ✅ `useRegisterInstitution()`
- ✅ `useGetInstitution(address)`
- ✅ `useInstitutionExists(address)`
- ✅ `useIsVerifiedInstitution(address)`
- ✅ `useCreateTemplate()`
- ✅ `useGetTemplate(id)`
- ✅ `useListPublicTemplates()`
- ✅ `useGetInstitutionTemplates(address)`

---

## ⚠️ MISSING: NameRegistry Hooks

### **Add these 3 hooks:**

```typescript
// src/hooks/useContracts.ts

/**
 * Hook to set display name for connected wallet
 */
export function useSetName() {
  const { config } = usePrepareContractWrite({
    address: CONTRACTS.sepolia.NameRegistry as `0x${string}`,
    abi: NAME_REGISTRY_ABI,
    functionName: "setName",
  });

  const { data, write, isLoading, isSuccess, error } = useContractWrite(config);

  return {
    setName: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to clear display name
 */
export function useClearName() {
  const { config } = usePrepareContractWrite({
    address: CONTRACTS.sepolia.NameRegistry as `0x${string}`,
    abi: NAME_REGISTRY_ABI,
    functionName: "clearName",
  });

  const { data, write, isLoading, isSuccess, error } = useContractWrite(config);

  return {
    clearName: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to get display name for an address
 */
export function useGetName(address: string | undefined) {
  const { data, isLoading, isError, error } = useContractRead({
    address: CONTRACTS.sepolia.NameRegistry as `0x${string}`,
    abi: NAME_REGISTRY_ABI,
    functionName: "getName",
    args: address ? [address as `0x${string}`] : undefined,
    enabled: !!address,
  });

  return {
    displayName: data as string | undefined,
    isLoading,
    isError,
    error,
  };
}
```

---

## ⚠️ MISSING: NameRegistry ABI

### **Add to src/contracts/abis.js:**

```javascript
import NameRegistryABI from "./abi/NameRegistry.json";

export const NAME_REGISTRY_ABI = NameRegistryABI;
```

**Note:** You already have the NameRegistry.json file in src/contracts/abi/

---

## 🔧 REQUIRED FRONTEND UPDATES

### **1. Issue Page - Add Template Support**

**Current:** Only allows basic certificate issuance  
**Needed:** Template selection dropdown

```typescript
// src/app/issue/page.tsx

// Add template selection
const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
const { data: publicTemplates } = useListPublicTemplates();
const { data: myTemplates } = useGetInstitutionTemplates(address);

// In form:
<select
  value={selectedTemplate || ""}
  onChange={(e) => setSelectedTemplate(Number(e.target.value))}
>
  <option value="">No Template</option>
  {publicTemplates?.map((id) => (
    <option key={id} value={id}>
      Template #{id}
    </option>
  ))}
</select>;

// When issuing:
if (selectedTemplate) {
  await issueCertificateWithTemplate({
    args: [recipient, ipfsHash, certificateType, selectedTemplate],
  });
} else {
  await issueCertificate({
    args: [recipient, ipfsHash, certificateType],
  });
}
```

---

### **2. Organizer Page - Add Institution Registration**

**Current:** Uses old ethers.js  
**Needed:** Wagmi-based registration

```typescript
// src/app/organizer/page.tsx

import {
  useRegisterInstitution,
  useInstitutionExists,
} from "@/hooks/useContracts";
import { useAccount } from "wagmi";

const { address } = useAccount();
const { data: isRegistered } = useInstitutionExists(address);
const { write: registerInstitution } = useRegisterInstitution();

// Registration form
const handleRegister = async () => {
  // Upload logo to IPFS first
  const { ipfsHash: logoHash } = await uploadFileToIPFS(logoFile);

  // Register
  await registerInstitution({
    args: [institutionName, logoHash, contactInfo],
  });
};

// Note: Institution is AUTO-VERIFIED after registration!
```

---

### **3. Create Template Management Page**

**New File:** `src/app/templates/page.tsx`

```typescript
"use client";

import {
  useCreateTemplate,
  useListPublicTemplates,
  useGetInstitutionTemplates,
} from "@/hooks/useContracts";
import { useAccount } from "wagmi";
import { uploadJSONToIPFS } from "@/lib/ipfs";

export default function TemplatesPage() {
  const { address } = useAccount();
  const { write: createTemplate } = useCreateTemplate();
  const { data: publicTemplates } = useListPublicTemplates();
  const { data: myTemplates } = useGetInstitutionTemplates(address);

  const handleCreateTemplate = async (templateData) => {
    // Upload template design to IPFS
    const { ipfsHash } = await uploadJSONToIPFS({
      name: templateData.name,
      design: templateData.design,
      fields: templateData.fields,
    });

    // Create on blockchain
    await createTemplate({
      args: [ipfsHash, templateData.isPublic, templateData.category],
    });
  };

  return (
    <div>
      <h1>Certificate Templates</h1>

      {/* Template Creation Form */}
      {/* List of Public Templates */}
      {/* List of My Templates */}
    </div>
  );
}
```

---

### **4. Update Verify Page - Show Revoked Status**

**Current:** Shows valid/invalid  
**Needed:** Show revoked certificates distinctly

```typescript
// src/app/verify/[[...id]]/page.tsx

// After loading certificate
if (certData.revoked) {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6">
      <div className="flex items-center gap-4">
        <FiAlertCircle className="text-3xl text-yellow-500" />
        <div>
          <h3 className="text-2xl font-bold text-yellow-700">
            ⚠️ Certificate Revoked
          </h3>
          <p className="text-gray-700">
            This certificate was issued but has been revoked by the issuer.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### **5. Add Display Name Support**

**Throughout UI:** Show display names instead of addresses

```typescript
// Create a component: src/components/DisplayName.tsx

import { useGetName } from '@/hooks/useContracts';
import { formatAddress } from '@/utils/helpers';

export function DisplayName({ address }: { address: string }) {
  const { displayName } = useGetName(address);

  if (displayName && displayName.length > 0) {
    return (
      <span title={address}>
        {displayName} <span className="text-gray-400 text-sm">({formatAddress(address)})</span>
      </span>
    );
  }

  return <span>{formatAddress(address)}</span>;
}

// Use everywhere you show addresses:
<DisplayName address={certificate.issuer} />
<DisplayName address={certificate.recipient} />
```

---

### **6. Add Name Setting in User Profile**

```typescript
// Add to Dashboard or User page

import { useSetName, useGetName } from "@/hooks/useContracts";

const { address } = useAccount();
const { displayName } = useGetName(address);
const { write: setName } = useSetName();

<div className="bg-white rounded-xl p-6">
  <h3>Display Name</h3>
  <p className="text-sm text-gray-600 mb-4">
    Current: {displayName || "Not set"}
  </p>
  <input
    type="text"
    placeholder="Enter your display name"
    className="input-field"
  />
  <button onClick={() => setName({ args: [newName] })} className="btn-primary">
    Set Display Name
  </button>
</div>;
```

---

## 📊 CERTIFICATE STRUCT - Exact Match

### **Contract Definition:**

```solidity
struct Certificate {
    string ipfsHash;
    address issuer;
    address recipient;
    uint256 issuedAt;
    string certificateType;
    bool revoked;
}
```

### **TypeScript Interface:**

```typescript
// src/types/certificate.ts

export interface Certificate {
  ipfsHash: string;
  issuer: string;
  recipient: string;
  issuedAt: bigint;
  certificateType: string;
  revoked: boolean;
}

// Metadata from IPFS
export interface CertificateMetadata {
  name: string;
  description?: string;
  courseName?: string;
  courseDetails?: string;
  grade?: string;
  issueDate?: number;
  expiryDate?: number;
  [key: string]: any;
}
```

---

## 📋 INSTITUTION STRUCT - Exact Match

### **Contract Definition:**

```solidity
struct Institution {
    string name;
    string logoIpfsHash;
    string contactInfo;
    uint256 totalCertificatesIssued;
    uint256 registeredAt;
    bool verified;
}
```

### **TypeScript Interface:**

```typescript
// src/types/institution.ts

export interface Institution {
  name: string;
  logoIpfsHash: string;
  contactInfo: string;
  totalCertificatesIssued: bigint;
  registeredAt: bigint;
  verified: boolean;
}
```

---

## 📋 TEMPLATE STRUCT - Exact Match

### **Contract Definition:**

```solidity
struct Template {
    string ipfsHash;
    address creator;
    bool isPublic;
    string category;
    uint256 usageCount;
    uint256 createdAt;
}
```

### **TypeScript Interface:**

```typescript
// src/types/template.ts

export interface Template {
  ipfsHash: string;
  creator: string;
  isPublic: boolean;
  category: string;
  usageCount: bigint;
  createdAt: bigint;
}
```

---

## 🎨 UI ENHANCEMENTS

### **1. Template Selector Component**

Create: `src/components/TemplateSelector.tsx`

```typescript
import { useListPublicTemplates, useGetTemplate } from "@/hooks/useContracts";

export function TemplateSelector({ value, onChange }) {
  const { data: templateIds } = useListPublicTemplates();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div
        onClick={() => onChange(null)}
        className={`border-2 rounded-lg p-4 cursor-pointer ${
          !value ? "border-saffron" : "border-gray-200"
        }`}
      >
        <h4>No Template</h4>
        <p className="text-sm text-gray-600">Plain certificate</p>
      </div>

      {templateIds?.map((id) => (
        <TemplateCard
          key={id}
          templateId={id}
          selected={value === id}
          onClick={() => onChange(id)}
        />
      ))}
    </div>
  );
}
```

---

### **2. Revoked Certificate Badge**

```typescript
// src/components/CertificateCard.tsx

{
  certificate.revoked && (
    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
      REVOKED
    </div>
  );
}
```

---

## 🔄 BATCH ISSUANCE WITH TEMPLATES

### **Important:** Each recipient can have a DIFFERENT template!

```typescript
// In Issue page batch form

const handleBatchWithTemplates = async () => {
  // Parse CSV
  const recipients = csvData.map((row) => row.address);
  const ipfsHashes = await Promise.all(
    csvData.map((row) => uploadJSONToIPFS(row.metadata))
  );
  const templateIds = csvData.map((row) => row.templateId || 0);

  // Issue
  await batchIssueCertificatesWithTemplates({
    args: [recipients, ipfsHashes, certificateType, templateIds],
  });
};
```

---

## 📝 CSV FORMAT FOR BATCH WITH TEMPLATES

```csv
address,name,templateId,courseName,grade
0x1234...5678,John Doe,1,Web3 Dev,A+
0x8765...4321,Jane Smith,2,Blockchain,A
0x9999...0000,Bob Johnson,1,Smart Contracts,B+
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before testing:

- [ ] Add NameRegistry ABI to abis.js
- [ ] Add 3 NameRegistry hooks to useContracts.ts
- [ ] Create DisplayName component
- [ ] Update Issue page with template selector
- [ ] Update Organizer page with Wagmi registration
- [ ] Create Templates page
- [ ] Update Verify page with revoked status
- [ ] Add display name setting to Dashboard
- [ ] Update all TypeScript interfaces to match contract structs
- [ ] Test all 4 contracts on Sepolia

---

## ✅ TESTING FLOWS

### **1. Institution Registration:**

```
1. Connect wallet
2. Go to /organizer
3. Fill registration form (name, logo, contact)
4. Upload logo to IPFS
5. Call registerInstitution()
6. ✅ Institution is AUTO-VERIFIED
```

### **2. Issue Certificate with Template:**

```
1. Go to /issue
2. Select template from dropdown
3. Fill recipient details
4. Upload metadata to IPFS
5. Call issueCertificateWithTemplate()
6. ✅ Certificate issued + template linked
```

### **3. Batch Issue with Different Templates:**

```
1. Go to /issue → Batch mode
2. Upload CSV with template IDs
3. Upload metadata for each
4. Call batchIssueCertificatesWithTemplates()
5. ✅ Each recipient gets their specified template
```

### **4. Set Display Name:**

```
1. Go to /dashboard
2. Click "Set Display Name"
3. Enter name (e.g., "MIT University")
4. Call setName()
5. ✅ Name shows instead of address everywhere
```

---

## 🎉 FINAL RESULT

After all updates, frontend will:

- ✅ Match ALL smart contract function signatures
- ✅ Support template creation and selection
- ✅ Support batch issuance with per-recipient templates
- ✅ Show display names instead of addresses
- ✅ Handle revoked certificates properly
- ✅ Auto-verify institutions on registration
- ✅ Use correct TypeScript types matching Solidity structs

**Frontend will be 100% aligned with smart contracts!** 🚀

---

**Generated:** October 26, 2025  
**Ready for:** Complete Implementation
