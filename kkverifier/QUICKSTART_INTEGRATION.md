# 🎯 QUICK START GUIDE - Smart Contract Integration

## ✅ What's Complete

### 1. Smart Contract ABIs (3 contracts)

- ✅ `CertificateRegistry.json` - Main certificate management
- ✅ `InstitutionRegistry.json` - Institution registration
- ✅ `TemplateManager.json` - Certificate templates

### 2. React Hooks (22 hooks total)

All ready to use in your components!

### 3. IPFS Integration

- ✅ Pinata configured with your credentials
- ✅ Upload JSON metadata
- ✅ Upload files (logos, images)
- ✅ Retrieve from IPFS

---

## 🚀 How to Use Right Now

### Example 1: Issue a Certificate

```typescript
"use client";

import { useIssueCertificate } from "@/hooks/useContracts";
import { uploadJSONToIPFS } from "@/lib/ipfs";
import { useState } from "react";

export default function IssuePage() {
  const [loading, setLoading] = useState(false);
  const { issueCertificate, isSuccess } = useIssueCertificate();

  const handleIssue = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create metadata
      const metadata = {
        name: "Blockchain Course Certificate",
        description: "Completed advanced blockchain development course",
        certificateType: "Course Completion",
        recipientName: e.target.name.value,
        recipientAddress: e.target.address.value,
        issuerName: "KK Academy",
        issueDate: new Date().toISOString(),
        attributes: [
          { trait_type: "Course", value: "Blockchain Dev" },
          { trait_type: "Grade", value: "A+" },
        ],
      };

      // 2. Upload to IPFS
      const { ipfsHash } = await uploadJSONToIPFS(metadata);
      console.log("Uploaded to IPFS:", ipfsHash);

      // 3. Issue on blockchain
      await issueCertificate?.({
        args: [
          e.target.address.value, // recipient
          ipfsHash, // IPFS hash
          "Course Completion", // certificate type
        ],
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to issue certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Issue Certificate</h1>

      {isSuccess && (
        <div className="bg-green-100 p-4 rounded mb-4">
          ✅ Certificate issued successfully!
        </div>
      )}

      <form onSubmit={handleIssue} className="space-y-4">
        <input
          name="name"
          placeholder="Recipient Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="address"
          placeholder="Recipient Wallet Address (0x...)"
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-saffron text-white px-6 py-3 rounded"
        >
          {loading ? "Issuing..." : "Issue Certificate"}
        </button>
      </form>
    </div>
  );
}
```

### Example 2: View My Certificates

```typescript
"use client";

import {
  useGetCertificatesByRecipient,
  useCertificate,
} from "@/hooks/useContracts";
import { useAccount } from "wagmi";
import { getJSONFromIPFS } from "@/lib/ipfs";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { address } = useAccount();
  const { certificateIds, isLoading } = useGetCertificatesByRecipient(address);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Certificates</h1>
      <div className="grid grid-cols-3 gap-4">
        {certificateIds?.map((id) => (
          <CertificateCard key={id.toString()} certificateId={id} />
        ))}
      </div>
    </div>
  );
}

function CertificateCard({ certificateId }) {
  const { certificate } = useCertificate(certificateId);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    if (certificate?.ipfsHash) {
      getJSONFromIPFS(certificate.ipfsHash)
        .then(setMetadata)
        .catch(console.error);
    }
  }, [certificate]);

  return (
    <div className="border border-tricolor p-4 rounded-lg">
      <h3 className="font-bold">{metadata?.name || "Certificate"}</h3>
      <p className="text-sm text-gray-600">
        Type: {certificate?.certificateType}
      </p>
      <p className="text-sm">
        Issued:{" "}
        {new Date(Number(certificate?.issuedAt) * 1000).toLocaleDateString()}
      </p>
      {certificate?.revoked && (
        <span className="text-red-500 text-sm">⚠️ Revoked</span>
      )}
      <button className="mt-2 bg-green text-white px-4 py-2 rounded text-sm">
        View Details
      </button>
    </div>
  );
}
```

### Example 3: Batch Issue from CSV

```typescript
"use client";

import { useBatchIssueCertificates } from "@/hooks/useContracts";
import { uploadJSONToIPFS } from "@/lib/ipfs";
import { useState } from "react";

export default function BatchIssuePage() {
  const [csvData, setCsvData] = useState([]);
  const { batchIssueCertificates, isLoading } = useBatchIssueCertificates();

  const handleCSV = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").slice(1); // Skip header
      const data = rows.map((row) => {
        const [name, address, course] = row.split(",");
        return { name, address, course };
      });
      setCsvData(data);
    };

    reader.readAsText(file);
  };

  const handleBatchIssue = async () => {
    try {
      // 1. Upload all metadata to IPFS
      const uploads = await Promise.all(
        csvData.map((row) =>
          uploadJSONToIPFS({
            name: `${row.course} Certificate`,
            description: `Certificate of completion for ${row.course}`,
            certificateType: "Course Completion",
            recipientName: row.name,
            recipientAddress: row.address,
            issuerName: "KK Academy",
            issueDate: new Date().toISOString(),
            attributes: [{ trait_type: "Course", value: row.course }],
          })
        )
      );

      // 2. Batch issue on blockchain
      await batchIssueCertificates?.({
        args: [
          csvData.map((row) => row.address),
          uploads.map((u) => u.ipfsHash),
          "Course Completion",
        ],
      });

      alert("✅ Batch issued successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to batch issue");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Batch Issue Certificates</h1>

      <div className="mb-4">
        <label className="block mb-2">
          Upload CSV (name, address, course):
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSV}
          className="border p-2 rounded"
        />
      </div>

      {csvData.length > 0 && (
        <div>
          <p className="mb-2">Found {csvData.length} recipients</p>
          <button
            onClick={handleBatchIssue}
            disabled={isLoading}
            className="bg-saffron text-white px-6 py-3 rounded"
          >
            {isLoading ? "Issuing..." : "Batch Issue"}
          </button>
        </div>
      )}
    </div>
  );
}
```

### Example 4: Template Selection

```typescript
"use client";

import { useListPublicTemplates, useGetTemplate } from "@/hooks/useContracts";

export default function TemplatesPage() {
  const { templateIds } = useListPublicTemplates();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Certificate Templates</h1>
      <div className="grid grid-cols-4 gap-4">
        {templateIds?.map((id) => (
          <TemplatePreview key={id.toString()} templateId={id} />
        ))}
      </div>
    </div>
  );
}

function TemplatePreview({ templateId }) {
  const { template } = useGetTemplate(templateId);

  return (
    <div className="border p-4 rounded hover:shadow-lg cursor-pointer">
      <h3 className="font-bold">Template #{templateId.toString()}</h3>
      <p className="text-sm text-gray-600">{template?.category}</p>
      <p className="text-xs mt-2">
        Used {template?.usageCount?.toString()} times
      </p>
    </div>
  );
}
```

---

## 📋 Before You Start

### Required Environment Variables

Add these to `.env.local`:

```bash
# Get from your deployed contracts or deploy new ones
NEXT_PUBLIC_CERTIFICATE_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_TEMPLATE_MANAGER_ADDRESS=0x...

# Get from https://dashboard.alchemy.com/
NEXT_PUBLIC_ALCHEMY_KEY=your_key_here

# Get from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# ✅ Already configured:
NEXT_PUBLIC_PINATA_API_KEY=d9613b55c80e5391e666
PINATA_JWT=eyJhbGciOiJIUzI1NiIs...

# Get from https://app.supabase.com/ (optional for now)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## 🎨 All Available Hooks

### Certificate Operations

```typescript
import {
  useIssueCertificate,
  useIssueCertificateWithTemplate,
  useBatchIssueCertificates,
  useBatchIssueCertificatesWithTemplates,
  useCertificate,
  useGetCertificatesByRecipient,
  useGetCertificatesByInstitution,
  useRevokeCertificate,
  useIsAuthorizedInstitution,
} from "@/hooks/useContracts";
```

### Institution Operations

```typescript
import {
  useRegisterInstitution,
  useGetInstitution,
  useInstitutionExists,
  useIsVerifiedInstitution,
  useUpdateInstitutionInfo,
  useInstitutionCount,
} from "@/hooks/useContracts";
```

### Template Operations

```typescript
import {
  useCreateTemplate,
  useGetTemplate,
  useListPublicTemplates,
  useGetInstitutionTemplates,
  useTemplateCounter,
} from "@/hooks/useContracts";
```

### IPFS Operations

```typescript
import {
  uploadJSONToIPFS,
  uploadFileToIPFS,
  getJSONFromIPFS,
} from "@/lib/ipfs";
```

---

## 🔥 You Can Build RIGHT NOW:

1. ✅ **Issue Certificate Page** - Single issuance with form
2. ✅ **Batch Issue Page** - CSV upload for bulk issuance
3. ✅ **My Certificates** - User dashboard showing all certs
4. ✅ **Verify Certificate** - Public verification page
5. ✅ **Template Gallery** - Browse and select templates
6. ✅ **Institution Registration** - Register new institutions

All the hooks are ready. Just import and use them!

---

## 📖 Full Documentation

Read `SMART_CONTRACT_INTEGRATION.md` for:

- Complete function reference
- All 7 detailed examples
- Data flow diagrams
- Integration checklist
- Troubleshooting guide

---

## 🎉 Summary

You now have **22 React hooks** connected to **3 smart contracts** with **33+ functions** ready to use!

Just add your contract addresses to `.env.local` and start building pages! 🚀
