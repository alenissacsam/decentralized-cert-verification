# 🔐 Role-Based Access Control - Implementation Guide

## Overview

KK Verifier now includes **role-based access control** that verifies wallet addresses before granting access to organizer or user dashboards.

## How It Works

### 1. **Hardcoded Organizer Whitelist** (Prototype)

- Organizer wallet addresses are stored in `/src/contracts/config.js`
- When a user connects their wallet, the system checks if their address is in the authorized list
- If authorized → Access to Organizer Dashboard
- If not → Access to User Dashboard only

### 2. **User Flow**

```
Homepage
  ↓
User Clicks "I'm an Organizer" or "I'm a User"
  ↓
MetaMask Connection Request
  ↓
Wallet Connected → Role Verification
  ↓
┌─────────────────────┬──────────────────────┐
│                     │                      │
Wallet IS in list    Wallet NOT in list
│                     │                      │
Role: "organizer"     Role: "user"
│                     │                      │
→ /organizer         → /user
```

### 3. **Access Control**

- ✅ **Organizers**: Can issue certificates, choose templates, batch upload
- ✅ **Users**: Can view their certificates, download, share
- ⚠️ **Non-organizers trying to access /organizer**: Get redirected or see error message

## Configuration

### Add Authorized Organizers

**File:** `/src/contracts/config.js`

```javascript
// Hardcoded authorized organizer addresses (for prototype)
export const AUTHORIZED_ORGANIZERS = [
  "0x1234567890123456789012345678901234567890", // Organizer 1
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", // Organizer 2
  "0x0987654321098765432109876543210987654321", // Organizer 3
  // Add more addresses here
];
```

**Steps to add organizer:**

1. Open `/src/contracts/config.js`
2. Copy the organizer's wallet address from MetaMask
3. Add it to the `AUTHORIZED_ORGANIZERS` array
4. Save the file
5. The new organizer can now access the organizer dashboard

### Important Notes

**Case-Insensitive Matching:**

- Addresses are normalized to lowercase for comparison
- `0xABC...` and `0xabc...` are treated as the same address

**Format:**

- Addresses MUST include the `0x` prefix
- Addresses MUST be 42 characters long (0x + 40 hex characters)

## Code Implementation

### Web3Context.js - Role Detection

```javascript
// Check if wallet address is an authorized organizer
const checkUserRole = (address) => {
  if (!address) return null;

  const normalizedAddress = address.toLowerCase();

  const isOrganizer = AUTHORIZED_ORGANIZERS.some(
    (orgAddress) => orgAddress.toLowerCase() === normalizedAddress
  );

  return isOrganizer ? "organizer" : "user";
};
```

### Homepage - Auto-Redirect

```javascript
const handleRoleSelection = async (role) => {
  const result = await connectWallet();

  if (result.success) {
    // Check if user role matches requested role
    if (result.role === "organizer" && role === "organizer") {
      router.push("/organizer");
    } else if (result.role === "user" && role === "user") {
      router.push("/user");
    } else if (result.role === "user" && role === "organizer") {
      // User tried to access organizer dashboard but isn't authorized
      setShowError(
        "⚠️ Access Denied: Your wallet is not authorized as an organizer"
      );
    }
  }
};
```

## User Experience

### Successful Organizer Login

1. User clicks "I'm an Organizer"
2. MetaMask popup appears → User approves
3. Console shows: `✅ Connected! User role: organizer`
4. Auto-redirects to `/organizer`
5. Can access all organizer features

### Unauthorized Organizer Attempt

1. User clicks "I'm an Organizer"
2. MetaMask popup appears → User approves
3. Console shows: `✅ Connected! User role: user`
4. Error message: "⚠️ Access Denied: Your wallet is not authorized as an organizer"
5. User stays on homepage or redirected to `/user`

### User Login

1. User clicks "I'm a User"
2. MetaMask popup appears → User approves
3. Console shows: `✅ Connected! User role: user`
4. Auto-redirects to `/user`
5. Can view their certificates

## Testing

### Test Organizer Access

```bash
# 1. Add your wallet address to AUTHORIZED_ORGANIZERS
# 2. Refresh the page
# 3. Click "I'm an Organizer"
# 4. Connect wallet
# 5. Should redirect to /organizer
```

### Test User Access

```bash
# 1. Use a wallet NOT in AUTHORIZED_ORGANIZERS
# 2. Click "I'm a User"
# 3. Connect wallet
# 4. Should redirect to /user
```

### Test Access Denial

```bash
# 1. Use a wallet NOT in AUTHORIZED_ORGANIZERS
# 2. Click "I'm an Organizer"
# 3. Connect wallet
# 4. Should see error message
```

## Production Migration

For production, replace hardcoded addresses with smart contract:

```solidity
// OrganizationRegistry.sol
contract OrganizationRegistry {
    mapping(address => bool) public authorizedOrganizers;

    function addOrganizer(address organizer) public onlyAdmin {
        authorizedOrganizers[organizer] = true;
    }

    function isOrganizer(address wallet) public view returns (bool) {
        return authorizedOrganizers[wallet];
    }
}
```

Then update Web3Context:

```javascript
const checkUserRole = async (address) => {
  const organizationSDK = new OrganizationSDK(provider, network);
  const isOrganizer = await organizationSDK.isOrganizer(address);
  return isOrganizer ? "organizer" : "user";
};
```

## Security Considerations

⚠️ **Frontend-Only Check (Prototype):**

- Current implementation only checks on frontend
- NOT secure for production
- Malicious users can bypass by directly visiting `/organizer`

✅ **Production Requirements:**

- Smart contract must enforce role checks
- All certificate issuance functions must verify `msg.sender` is authorized
- Backend API (if used) must verify wallet signatures

## Files Modified

1. ✅ `/src/contracts/config.js` - Added AUTHORIZED_ORGANIZERS array
2. ✅ `/src/contexts/Web3Context.js` - Added role checking logic
3. ✅ `/src/app/page.js` - Added wallet connect with auto-redirect
4. ✅ Context value now includes `userRole` state

## Next Steps

1. **Add Your Organizer Address:**

   - Copy your MetaMask wallet address
   - Add to `AUTHORIZED_ORGANIZERS` in `/src/contracts/config.js`

2. **Test the Flow:**

   - Try logging in as organizer (authorized wallet)
   - Try logging in as user (non-authorized wallet)
   - Try accessing /organizer directly without connecting

3. **Add More Organizers:**
   - Simply add their addresses to the array
   - No code changes needed

## Status

🟢 **IMPLEMENTED** - Role-based access control is now active!
⚠️ **PROTOTYPE MODE** - Uses hardcoded addresses (perfect for demo/testing)
🔜 **TODO**: Migrate to smart contract for production
