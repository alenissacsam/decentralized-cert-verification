# 🔍 SMART CONTRACT ANALYSIS - Complete Function Mapping

**Repository:** https://github.com/alenissacsam/decentralized-cert-verification  
**Analysis Date:** October 26, 2025  
**Status:** ✅ Complete Analysis - Ready for Frontend Alignment

---

## 📋 CONTRACT ADDRESSES (Sepolia Testnet)

```
CertificateRegistry: 0xe38C32FC0290ceb5189d4dF130c37d0C82ce876f
InstitutionRegistry: 0xD4C4cc66c7FF23260287dc3a3985AA5f6bA7b059
TemplateManager:     0x5D61562121d28b772e4f782DC12f61FfCbd861ad
NameRegistry:        0xAD96F1220a5Ead242ED3ec774a9FB59e157d8520
```

---

## 🎯 KEY INSIGHTS FROM SMART CONTRACTS

### **Architecture:**

- **ERC-1155 Soulbound Tokens** - Certificates are non-transferable
- **Auto-Verified Institutions** - Institutions auto-verify on registration
- **Template System** - Reusable certificate templates with usage tracking
- **Name Registry** - Human-readable wallet names

---

## 📜 CONTRACT 1: CertificateRegistry

### **Core Functions:**

#### ✅ **issueCertificate**

```solidity
function issueCertificate(
    address recipient,
    string calldata ipfsHash,
    string calldata certificateType
) external nonReentrant returns (uint256 certificateId)
```

**Parameters:**

- `recipient` - Recipient wallet address
- `ipfsHash` - IPFS CID for metadata
- `certificateType` - Classification (e.g., "Course Completion", "Achievement")

**Returns:** `certificateId` - Unique certificate ID

**Requirements:**

- Caller must be verified institution
- Recipient cannot be zero address
- ipfsHash and certificateType cannot be empty

---

#### ✅ **issueCertificateWithTemplate**

```solidity
function issueCertificateWithTemplate(
    address recipient,
    string calldata ipfsHash,
    string calldata certificateType,
    uint256 templateId
) external nonReentrant returns (uint256 certificateId)
```

**Additional Parameter:**

- `templateId` - Template ID from TemplateManager

**Behavior:**

- Issues certificate AND links it to a template
- Increments template usage count

---

#### ✅ **batchIssueCertificates**

```solidity
function batchIssueCertificates(
    address[] calldata recipients,
    string[] calldata ipfsHashes,
    string calldata certificateType
) external nonReentrant returns (uint256[] memory certificateIds)
```

**Parameters:**

- `recipients` - Array of recipient addresses
- `ipfsHashes` - Array of IPFS hashes (one per recipient)
- `certificateType` - Shared type for all certificates

**Requirements:**

- Arrays must be same length
- All recipients must be valid addresses

---

#### ✅ **batchIssueCertificatesWithTemplates**

```solidity
function batchIssueCertificatesWithTemplates(
    address[] calldata recipients,
    string[] calldata ipfsHashes,
    string calldata certificateType,
    uint256[] calldata templateIds
) external nonReentrant returns (uint256[] memory certificateIds)
```

**Additional Parameter:**

- `templateIds` - Array of template IDs (one per recipient)

**Note:** Each recipient can have a DIFFERENT template!

---

#### ✅ **verifyCertificate**

```solidity
function verifyCertificate(uint256 certificateId)
    external view returns (Certificate memory)
```

**Returns Certificate struct:**

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

---

#### ✅ **revokeCertificate**

```solidity
function revokeCertificate(uint256 certificateId) external
```

**Requirements:**

- Caller must be the issuer
- Certificate must exist
- Certificate must not already be revoked

**Note:** Revokes WITHOUT burning the token (remains in wallet)

---

#### ✅ **getCertificatesByInstitution**

```solidity
function getCertificatesByInstitution(address institution)
    external view returns (uint256[] memory)
```

**Returns:** Array of certificate IDs issued by the institution

---

#### ✅ **getCertificatesByRecipient**

```solidity
function getCertificatesByRecipient(address recipient)
    external view returns (uint256[] memory)
```

**Returns:** Array of certificate IDs owned by the recipient

---

#### ✅ **uri**

```solidity
function uri(uint256 certificateId)
    public view override returns (string memory)
```

**Behavior:**

- Returns IPFS hash directly if it has protocol prefix (ipfs:// or https://)
- Otherwise prepends baseUri

---

### **Transfer Protection:**

```solidity
// ALL TRANSFERS ARE DISABLED
function safeTransferFrom() public pure override { revert TransfersDisabled(); }
function safeBatchTransferFrom() public pure override { revert TransfersDisabled(); }
function setApprovalForAll() public pure override { revert TransfersDisabled(); }
```

**Result:** Certificates are SOULBOUND (non-transferable)

---

## 📜 CONTRACT 2: InstitutionRegistry

### **Core Functions:**

#### ✅ **registerInstitution**

```solidity
function registerInstitution(
    string calldata name,
    string calldata logoIpfsHash,
    string calldata contactInfo
) external
```

**Behavior:**

- Registers institution
- **AUTO-VERIFIES** immediately (sets `verified = true`)
- Increments institution count

**Requirements:**

- Institution not already registered
- All fields must be non-empty

---

#### ✅ **verifyInstitution**

```solidity
function verifyInstitution(address institution) external
```

**Purpose:** Manual verification (available for future governance)

**Note:** Currently institutions auto-verify, but this remains for flexibility

---

#### ✅ **updateInstitutionInfo**

```solidity
function updateInstitutionInfo(
    string calldata logoIpfsHash,
    string calldata contactInfo
) external
```

**Requirements:**

- Caller must be registered institution
- Fields must be non-empty

---

#### ✅ **incrementCertificateCount**

```solidity
function incrementCertificateCount(address institution) external
```

**Note:** Only callable by CertificateRegistry contract

---

#### ✅ **getInstitution**

```solidity
function getInstitution(address institution)
    external view returns (Institution memory)
```

**Returns Institution struct:**

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

---

#### ✅ **institutionExists**

```solidity
function institutionExists(address institution)
    external view returns (bool)
```

**Returns:** true if institution is registered

---

#### ✅ **verifiedInstitutions** (public mapping)

```solidity
mapping(address => bool) public verifiedInstitutions;
```

**Used by:** CertificateRegistry to check authorization

---

## 📜 CONTRACT 3: TemplateManager

### **Core Functions:**

#### ✅ **createTemplate**

```solidity
function createTemplate(
    string calldata ipfsHash,
    bool isPublic,
    string calldata category
) external returns (uint256 templateId)
```

**Parameters:**

- `ipfsHash` - Template design/metadata on IPFS
- `isPublic` - Whether template is available to all institutions
- `category` - Classification (e.g., "Hackathon", "Course", "Achievement")

**Behavior:**

- Creates new template
- Adds to creator's template list
- If public, adds to public catalog

---

#### ✅ **getTemplate**

```solidity
function getTemplate(uint256 templateId)
    external view returns (Template memory)
```

**Returns Template struct:**

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

---

#### ✅ **listPublicTemplates**

```solidity
function listPublicTemplates()
    external view returns (uint256[] memory)
```

**Returns:** Array of public template IDs

---

#### ✅ **getInstitutionTemplates**

```solidity
function getInstitutionTemplates(address institution)
    external view returns (uint256[] memory)
```

**Returns:** Array of template IDs created by the institution

---

#### ✅ **incrementUsageCount**

```solidity
function incrementUsageCount(uint256 templateId) external
```

**Note:** Automatically called by CertificateRegistry when template is used

---

## 📜 CONTRACT 4: NameRegistry

### **Core Functions:**

#### ✅ **setName**

```solidity
function setName(string calldata name) external
```

**Purpose:** Set display name for caller's wallet

**Example:**

- Wallet: `0x1234...5678`
- Display Name: "Jane Doe" or "MIT University"

---

#### ✅ **clearName**

```solidity
function clearName() external
```

**Purpose:** Remove display name

---

#### ✅ **getName**

```solidity
function getName(address account)
    external view returns (string memory)
```

**Returns:** Display name or empty string if not set

---

## 🔧 FRONTEND REQUIREMENTS

### **What Frontend MUST Do:**

1. **Before Issuing Certificate:**

   - Check if wallet is verified institution: `verifiedInstitutions(address)`
   - If not, show "Register Institution" flow

2. **Issuing Single Certificate:**

   - Upload metadata to IPFS
   - Get IPFS hash (with or without `ipfs://` prefix)
   - Call `issueCertificate(recipient, ipfsHash, certificateType)`
   - OR call `issueCertificateWithTemplate()` if using template

3. **Issuing Batch Certificates:**

   - Upload metadata for each recipient (or use shared metadata)
   - Prepare arrays: recipients[], ipfsHashes[], templateIds[] (optional)
   - Call `batchIssueCertificates()` or `batchIssueCertificatesWithTemplates()`

4. **Viewing Certificates:**

   - Call `getCertificatesByRecipient(address)` to get IDs
   - For each ID, call `verifyCertificate(id)` to get details
   - Load metadata from IPFS using `ipfsHash`

5. **Template Management:**

   - Call `listPublicTemplates()` to show available templates
   - Call `getTemplate(id)` to get template details
   - Call `createTemplate()` to create new template

6. **Institution Management:**
   - Call `registerInstitution(name, logo, contact)` to register
   - Call `getInstitution(address)` to display institution info
   - Display name using `getName(address)` from NameRegistry

---

## ⚠️ CRITICAL DIFFERENCES FROM CURRENT FRONTEND

### **❌ What's WRONG in Current Frontend:**

1. **Certificate Structure Mismatch:**

   - Contract has: `ipfsHash`, `issuer`, `recipient`, `issuedAt`, `certificateType`, `revoked`
   - Frontend expects: Many more fields in Certificate object

2. **Function Signature Mismatch:**

   - Contract: `issueCertificate(recipient, ipfsHash, certificateType)`
   - Current hooks: May expect different parameters

3. **Template Linking:**

   - Contract has SEPARATE function: `issueCertificateWithTemplate()`
   - Batch has `batchIssueCertificatesWithTemplates()` - DIFFERENT SIGNATURES

4. **Auto-Verification:**

   - Contract: Institutions auto-verify on registration
   - Frontend: May check authorization differently

5. **No Certificate Burning:**
   - Contract: `revokeCertificate()` only sets flag
   - Frontend: Should not expect token to be burned

---

## ✅ FRONTEND ALIGNMENT CHECKLIST

- [ ] Update hooks to match exact function signatures
- [ ] Update Certificate type to match contract struct
- [ ] Implement template selection UI
- [ ] Add `issueCertificateWithTemplate()` support
- [ ] Add `batchIssueCertificatesWithTemplates()` support
- [ ] Update institution registration flow (auto-verify)
- [ ] Add template management page
- [ ] Add NameRegistry integration
- [ ] Update certificate display to show ALL struct fields
- [ ] Handle revoked certificates properly (show but mark as revoked)

---

## 📊 MAPPING: Contract Functions → Frontend Hooks

| Contract Function                       | Current Hook                               | Status               |
| --------------------------------------- | ------------------------------------------ | -------------------- |
| `issueCertificate()`                    | `useIssueCertificate()`                    | ⚠️ Check params      |
| `issueCertificateWithTemplate()`        | `useIssueCertificateWithTemplate()`        | ✅ Exists            |
| `batchIssueCertificates()`              | `useBatchIssueCertificates()`              | ⚠️ Check params      |
| `batchIssueCertificatesWithTemplates()` | `useBatchIssueCertificatesWithTemplates()` | ✅ Exists            |
| `verifyCertificate()`                   | `useCertificate()`                         | ⚠️ Check return type |
| `revokeCertificate()`                   | `useRevokeCertificate()`                   | ✅ Exists            |
| `getCertificatesByRecipient()`          | `useGetCertificatesByRecipient()`          | ✅ Exists            |
| `getCertificatesByInstitution()`        | `useGetCertificatesByInstitution()`        | ✅ Exists            |
| `registerInstitution()`                 | `useRegisterInstitution()`                 | ✅ Exists            |
| `getInstitution()`                      | `useGetInstitution()`                      | ✅ Exists            |
| `institutionExists()`                   | `useInstitutionExists()`                   | ✅ Exists            |
| `verifiedInstitutions`                  | `useIsVerifiedInstitution()`               | ✅ Exists            |
| `createTemplate()`                      | `useCreateTemplate()`                      | ✅ Exists            |
| `getTemplate()`                         | `useGetTemplate()`                         | ✅ Exists            |
| `listPublicTemplates()`                 | `useListPublicTemplates()`                 | ✅ Exists            |
| `getInstitutionTemplates()`             | `useGetInstitutionTemplates()`             | ✅ Exists            |
| `setName()`                             | ❌ Missing                                 | Need to add          |
| `getName()`                             | ❌ Missing                                 | Need to add          |

---

## 🚀 NEXT ACTIONS

1. **Add NameRegistry hooks** (setName, getName)
2. **Update Certificate type** to match contract struct exactly
3. **Update Issue page** to support templates
4. **Create Template Management page**
5. **Update Institution registration** (remove manual verify button)
6. **Update Verify page** to show revoked status
7. **Add display name support** throughout UI

---

**Generated:** October 26, 2025  
**For:** Complete Frontend-Smart Contract Alignment
