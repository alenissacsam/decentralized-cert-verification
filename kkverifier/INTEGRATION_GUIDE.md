# 🔗 Smart Contract Integration Guide

## For Your Teammate (Smart Contract Developer)

This document helps your teammate understand what the frontend expects from the Solidity smart contracts.

## 📋 Required Smart Contracts

### 1. CertificateManagement.sol

**Purpose**: Main contract for certificate issuance, verification, and management

**Required Functions**:

```solidity
// Issue a new certificate
function issueCertificate(
    address recipient,
    string memory certType,
    string memory certName,
    string memory courseDetails,
    string memory gradeInfo,
    uint256 issueDate,
    uint256 expiryDate
) external returns (uint256 certId);

// Batch issue certificates
function batchIssueCertificates(
    address[] memory recipients,
    string memory certType,
    string memory certName,
    string memory courseDetails
) external returns (uint256[] memory certIds);

// Verify certificate
function verifyCertificate(uint256 certId)
    external view returns (
        bool isValid,
        bytes32 certHash,
        CertificateDetails memory details
    );

// Get certificate details
function getCertificateDetails(uint256 certId)
    external view returns (Certificate memory);

// Get all certificates for a user
function getUserCertificates(address user)
    external view returns (uint256[] memory);

// Revoke certificate
function revokeCertificate(uint256 certId, string memory reason) external;

// Transfer certificate ownership
function transferCertificate(uint256 certId, address newOwner) external;

// Get total certificates issued
function totalCertificates() external view returns (uint256);
function nextCertId() external view returns (uint256);
```

**Required Structs**:

```solidity
struct Certificate {
    uint256 id;
    address issuer;
    address recipient;
    string certType;
    string certName;
    string courseDetails;
    string gradeInfo;
    uint256 issueDate;
    uint256 expiryDate;
    CertStatus status;
    bytes32 certHash;
}

enum CertStatus {
    Active,    // 0
    Revoked,   // 1
    Expired    // 2
}
```

**Required Events**:

```solidity
event CertificateIssued(
    uint256 indexed certId,
    address indexed issuer,
    address indexed recipient,
    string certName
);

event CertificateVerified(uint256 indexed certId, bool isValid);
event CertificateRevoked(uint256 indexed certId, address revoker, string reason);
event CertificateTransferred(uint256 indexed certId, address indexed from, address indexed to);
```

---

### 2. OrganizationRegistry.sol

**Purpose**: Manage organizations that can issue certificates

**Required Functions**:

```solidity
// Register new organization
function registerOrganization(
    string memory name,
    string memory orgType,
    string memory description,
    string memory websiteUrl
) external returns (bool);

// Admin verifies organization
function verifyOrganization(address org) external returns (bool);

// Get organization info
function getOrganizationInfo(address org)
    external view returns (Organization memory);

// Check if organization is verified
function isVerifiedOrganization(address org)
    external view returns (bool);

// Update trust score
function updateTrustScore(address org, uint256 newScore) external;
```

**Required Structs**:

```solidity
struct Organization {
    address orgAddress;
    string name;
    string orgType;
    string description;
    string websiteUrl;
    bool verified;
    uint256 trustScore;
    uint256 certificatesIssued;
    uint256 createdAt;
}
```

**Required Events**:

```solidity
event OrganizationRegistered(address indexed orgAddress, string name);
event OrganizationVerified(address indexed orgAddress, address verifier);
```

---

### 3. UserIdentity.sol

**Purpose**: Manage user registration and verification

**Required Functions**:

```solidity
// Register new user
function registerUser(string memory email, string memory phone)
    external returns (bool);

// Add verification
function addVerification(
    address user,
    uint8 verificationType,
    bytes memory verificationData
) external returns (bool);

// Get user profile
function getUserProfile(address user)
    external view returns (UserProfile memory);

// Check if user is registered
function isRegisteredUser(address user)
    external view returns (bool);
```

**Required Structs**:

```solidity
struct UserProfile {
    address userAddress;
    string email;
    uint256 verificationLevel;
    uint256 trustScore;
    uint256 createdAt;
}
```

---

### 4. BadgeSystem.sol (Optional but Recommended)

**Purpose**: Award digital badges for achievements

**Required Functions**:

```solidity
// Create badge template
function createBadgeTemplate(
    string memory name,
    string memory imageURI,
    string memory criteria
) external returns (uint256 badgeId);

// Award badge to user
function awardBadge(address recipient, uint256 badgeId)
    external returns (bool);

// Get user badges
function getUserBadges(address user)
    external view returns (uint256[] memory);

// Get badge details
function getBadgeDetails(uint256 badgeId)
    external view returns (Badge memory);
```

---

## 🔐 Security Requirements

### Access Control

```solidity
// Use OpenZeppelin's AccessControl
import "@openzeppelin/contracts/access/AccessControl.sol";

bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

// Only verified organizations can issue certificates
modifier onlyVerifiedOrganization() {
    require(organizationRegistry.isVerifiedOrganization(msg.sender), "Not verified");
    _;
}
```

### Pausable

```solidity
// Use OpenZeppelin's Pausable for emergency stop
import "@openzeppelin/contracts/security/Pausable.sol";

function pause() external onlyRole(ADMIN_ROLE) {
    _pause();
}

function unpause() external onlyRole(ADMIN_ROLE) {
    _unpause();
}
```

### Hash Verification

```solidity
// Create tamper-proof hash
function _createCertificateHash(Certificate memory cert)
    internal pure returns (bytes32)
{
    return keccak256(abi.encodePacked(
        cert.recipient,
        cert.certName,
        cert.courseDetails,
        cert.issueDate
    ));
}
```

---

## 📦 Deployment Checklist

### 1. Before Deployment

- [ ] All contracts compile without errors
- [ ] Unit tests pass (minimum 80% coverage)
- [ ] Function names match the interface above
- [ ] Events are emitted correctly
- [ ] Access control is properly implemented
- [ ] Input validation is in place

### 2. Deployment Steps

```bash
# Deploy to Polygon Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai

# Verify contracts on Polygonscan
npx hardhat verify --network mumbai CONTRACT_ADDRESS
```

### 3. After Deployment

- [ ] Save all contract addresses
- [ ] Extract ABIs from artifacts folder
- [ ] Share with frontend developer:
  - Contract addresses
  - ABIs
  - Network details (chain ID, RPC URL)
  - Block explorer links

### 4. Testing with Frontend

```bash
# Test certificate issuance
npx hardhat console --network mumbai

> const Cert = await ethers.getContractAt("CertificateManagement", "0x...")
> await Cert.issueCertificate(recipientAddress, "Course", "Test", "Details", "", timestamp, 0)

# Verify transaction on Polygonscan
```

---

## 🔄 How to Share ABIs

### Option 1: From Hardhat Artifacts

```bash
# After compiling contracts
cd artifacts/contracts/CertificateManagement.sol/
cat CertificateManagement.json | jq '.abi' > certificate-abi.json

# Share certificate-abi.json with frontend developer
```

### Option 2: Generate Human-Readable ABI

```javascript
// In your Hardhat project
const contract = await ethers.getContractFactory("CertificateManagement");
const interface = contract.interface;

// Get function signatures
console.log(interface.format("full"));
```

---

## 🧪 Testing Checklist

Test these scenarios before handing off to frontend:

### Certificate Management

- [ ] Issue single certificate successfully
- [ ] Issue batch certificates (multiple recipients)
- [ ] Verify valid certificate returns true
- [ ] Verify invalid certificate returns false
- [ ] Revoke certificate changes status
- [ ] Get user certificates returns array
- [ ] Transfer certificate updates ownership

### Organization Registry

- [ ] Register organization successfully
- [ ] Only admin can verify organizations
- [ ] Verified org can issue certificates
- [ ] Unverified org cannot issue certificates

### Error Cases

- [ ] Invalid address rejected
- [ ] Empty strings rejected
- [ ] Unauthorized access reverts
- [ ] Paused contract reverts

---

## 📞 Communication

### Information to Share

Create a JSON file with deployment info:

```json
{
  "network": "polygon-mumbai",
  "chainId": 80001,
  "contracts": {
    "CertificateManagement": {
      "address": "0x...",
      "blockExplorer": "https://mumbai.polygonscan.com/address/0x..."
    },
    "OrganizationRegistry": {
      "address": "0x...",
      "blockExplorer": "https://mumbai.polygonscan.com/address/0x..."
    },
    "UserIdentity": {
      "address": "0x...",
      "blockExplorer": "https://mumbai.polygonscan.com/address/0x..."
    },
    "BadgeSystem": {
      "address": "0x...",
      "blockExplorer": "https://mumbai.polygonscan.com/address/0x..."
    }
  },
  "deployer": "0x...",
  "deploymentDate": "2025-10-25T00:00:00Z"
}
```

---

## ⚠️ Common Issues & Solutions

### Issue: Frontend can't call functions

**Solution**: Ensure function visibility is `external` or `public`

### Issue: Events not showing in frontend

**Solution**: Ensure events are `indexed` for filtering

### Issue: Transaction reverts

**Solution**: Add descriptive revert messages:

```solidity
require(condition, "Clear error message");
```

### Issue: Gas estimation fails

**Solution**: Check for infinite loops or very large arrays

---

## ✅ Final Handoff

Once contracts are deployed and tested:

1. **Share**: Contract addresses + ABIs
2. **Document**: Any custom logic or special considerations
3. **Test**: Perform a test transaction together
4. **Monitor**: Watch the first few real transactions

---

**Good luck with the deployment! The frontend is ready and waiting! 🚀**
