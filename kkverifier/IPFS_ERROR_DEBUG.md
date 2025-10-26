# 🔍 IPFS Loading Error - Debugging Guide

## ❌ The Problem

The error shows: **"Error loading IPFS for cert 1: Failed to fetch from IPFS"**

This appears on both:

- `/verify` page - When trying to verify certificates
- `/dashboard` page - When trying to load user certificates

---

## 🎯 Root Causes

### 1. **Certificate Has No IPFS Hash**

The certificate was issued BEFORE the IPFS integration was added, so it has no metadata stored on IPFS.

**How to check**:

```javascript
// Open browser console on /verify or /dashboard
// You should see: "IPFS Hash: undefined" or "IPFS Hash: ''"
```

### 2. **IPFS Gateway Issue**

The Pinata gateway might not be accessible or the hash format is wrong.

**Current Gateway**:

```
https://ivory-bitter-gerbil-665.mypinata.cloud/ipfs/{hash}
```

### 3. **CORS Issue**

The browser might be blocking the IPFS request due to CORS policy.

---

## ✅ Fixes Applied

### Fix 1: Removed Supabase Code

**File**: `src/app/verify/[[...id]]/page.tsx`

Removed lines 83-93 that were trying to query Supabase (which doesn't exist).

### Fix 2: Added Better Error Logging

Added console.log statements to debug:

- Certificate data from blockchain
- IPFS hash value
- IPFS fetch URL
- Metadata loaded

### Fix 3: Better Error Messages

Now shows specific error:

- "Certificate has no metadata stored on IPFS" (if no hash)
- "Failed to load certificate metadata from IPFS: {error}" (if fetch fails)

---

## 🧪 How to Debug

### Step 1: Check Certificate Data

1. Go to http://localhost:3000/dashboard
2. Open browser console (F12)
3. Look for these messages:
   ```
   Certificate data from blockchain: {recipient, issuer, ipfsHash, ...}
   IPFS Hash: "Qm..." or undefined
   ```

### Step 2: Verify IPFS Hash Exists

If you see `IPFS Hash: undefined` or `IPFS Hash: ""`, it means:

- Certificate was issued before IPFS integration
- Need to issue a NEW certificate with the FIXED organizer page

### Step 3: Test IPFS Gateway Manually

If hash exists (e.g., "QmXXXXXX"), try accessing directly:

```
https://ivory-bitter-gerbil-665.mypinata.cloud/ipfs/QmXXXXXX
```

Should return JSON:

```json
{
  "name": "Certificate Name",
  "description": "...",
  "attributes": [...]
}
```

---

## 🚀 Solution: Issue a NEW Certificate

The certificates showing in your dashboard (IDs 1, 2) were likely issued BEFORE all the fixes. They don't have IPFS metadata.

### To Test Properly:

1. **Go to**: http://localhost:3000/organizer
2. **Connect wallet**
3. **Select template**: Professional Certificate
4. **Fill form** with REAL data:
   ```
   Recipient Address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
   Recipient Name: Gourav Test
   Course Name: Blockchain Development Test
   Grade: A
   ```
5. **Click**: "Issue Certificate"
6. **Watch console** for:
   ```
   ✅ Uploading metadata to IPFS...
   ✅ IPFS Hash: QmXXXX...
   ✅ Submitting to blockchain...
   ✅ Success! TX Hash: 0xXXXX...
   ```

### Then Verify:

1. Go to dashboard - New certificate should show
2. Go to verify page - Enter new certificate ID
3. Should load WITHOUT IPFS errors!

---

## 🔧 Alternative Fix: Test with Mock Data

If you want to test verify page WITHOUT issuing a new certificate:

### Option 1: Use Public IPFS Gateway

Edit `src/lib/ipfs.ts` line 117:

```typescript
// OLD
const gateway =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";

// NEW (Fallback to public gateway)
const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "ipfs.io";
```

### Option 2: Handle Missing Metadata Gracefully

Show certificate even without metadata:

```typescript
// In verify page - show basic blockchain data
if (!metadata) {
  return (
    <div>
      <h3>Certificate Found (No Metadata)</h3>
      <p>Recipient: {certificate.recipient}</p>
      <p>Issuer: {certificate.issuer}</p>
      <p>Type: {certificate.certificateType}</p>
    </div>
  );
}
```

---

## 📊 Expected Behavior

### ✅ Correct Flow:

1. User issues certificate via /organizer
2. Metadata uploaded to IPFS → Get hash (e.g., "QmXXXX...")
3. Contract called with (recipient, ipfsHash, certType)
4. Blockchain stores: ipfsHash = "QmXXXX..."
5. When viewing:
   - Fetch certificate from blockchain
   - Get ipfsHash from certificate
   - Fetch metadata from IPFS using hash
   - Display certificate with metadata

### ❌ Current Issue:

1. Old certificates (IDs 1, 2) were issued without IPFS
2. Blockchain has: ipfsHash = "" or undefined
3. Code tries to fetch from IPFS
4. Fails because no hash to fetch
5. Shows error: "Failed to fetch from IPFS"

---

## 🎯 Quick Fix for Your Demo

### Issue ONE New Certificate:

```bash
# On organizer page
Recipient: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
Name: Gourav Kumar
Course: Full Stack Blockchain Development
Grade: A+
Additional Info: Completed with honors
```

This will:

1. ✅ Upload to IPFS
2. ✅ Store hash on blockchain
3. ✅ Be verifiable on /verify page
4. ✅ Show in /dashboard WITH metadata

---

## 🐛 Check Console Now

Refresh your dashboard or verify page and check the console.

**Expected Output**:

```
Certificate data from blockchain: Object {recipient, issuer, ipfsHash, ...}
IPFS Hash: "" or undefined
No IPFS hash found for certificate
```

**This confirms**: Old certificates don't have IPFS metadata.

**Solution**: Issue new certificate with fixed code! 🚀
