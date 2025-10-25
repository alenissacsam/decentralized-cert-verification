# Product Requirements Document (PRD)
## Blockchain Certificate Verification Platform - Smart Contracts

**Project**: Certificate Verification Platform  
**Blockchain**: Sepolia Ethereum Testnet  
**Framework**: Foundry  
**Version**: 1.0.0  
**Date**: October 25, 2025

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Smart Contract Specifications](#smart-contract-specifications)
4. [File Structure](#file-structure)
5. [Implementation Details](#implementation-details)
6. [Testing Requirements](#testing-requirements)
7. [Deployment Instructions](#deployment-instructions)
8. [ABI Export for Frontend](#abi-export-for-frontend)
9. [Security Checklist](#security-checklist)
10. [Reference Projects](#reference-projects)

---

## 1. Project Overview

### Purpose
Build a blockchain-based certificate verification system that issues tamper-proof, verifiable certificates stored on the Ethereum blockchain. The system supports multiple institutions, QR-based verification, and certificate lifecycle management.

### Core Requirements
- Issue certificates as ERC-1155 NFTs (multi-token standard)
- Support multiple institutions with role-based access control
- Store certificate metadata on IPFS with on-chain hash reference
- Enable public verification of certificates
- Support certificate revocation
- Batch certificate issuance for hackathons/courses
- Template management for certificate designs

### Success Criteria
- All contracts compile without errors
- 90%+ test coverage
- Gas-optimized batch operations
- Successful deployment to Sepolia testnet
- Clean ABI export for frontend integration
- No critical security vulnerabilities

---

## 2. Technical Architecture

### Smart Contract Stack
```
CertificateRegistry.sol (Main Contract - ERC-1155)
    ├── Handles certificate minting, verification, revocation
    ├── Inherits: ERC1155, AccessControl, ReentrancyGuard, Pausable
    └── Interfaces with: InstitutionRegistry, TemplateManager

InstitutionRegistry.sol
    ├── Manages institution registration and verification
    ├── Tracks certificates issued per institution
    └── Inherits: AccessControl

TemplateManager.sol
    ├── Manages certificate template designs
    ├── Stores IPFS hashes for templates
    └── Inherits: AccessControl
```

### Technology Stack
- **Smart Contracts**: Solidity ^0.8.20
- **Framework**: Foundry (forge, cast, anvil)
- **Standards**: ERC-1155, ERC-165, AccessControl
- **Libraries**: OpenZeppelin Contracts v5.0
- **Testing**: Foundry Test (forge-std)
- **Deployment**: Sepolia Ethereum Testnet
- **Storage**: IPFS (off-chain metadata)

### Key Design Patterns
1. **Access Control Pattern**: Role-based permissions (ADMIN, ISSUER, PAUSER)
2. **Factory Pattern**: Standardized certificate creation
3. **State Machine**: Certificate lifecycle (Issued → Active → Revoked)
4. **Proxy Pattern**: Not implemented for MVP (can add later for upgradeability)
5. **Checks-Effects-Interactions**: Prevent reentrancy attacks

---

## 3. Smart Contract Specifications

### 3.1 CertificateRegistry.sol

**Purpose**: Main contract for certificate issuance, verification, and management.

**Token Standard**: ERC-1155 (Multi-token)

**State Variables**:
```solidity
uint256 public certificateCounter;  // Auto-incrementing certificate ID
mapping(uint256 => Certificate) public certificates;  // tokenId => Certificate data
mapping(address => bool) public authorizedInstitutions;  // Authorized issuers
mapping(address => uint256[]) public institutionCertificates;  // Institution => certificate IDs
mapping(uint256 => bool) public revokedCertificates;  // Revocation status
```

**Structs**:
```solidity
struct Certificate {
    string ipfsHash;           // IPFS CID of certificate metadata
    address issuer;            // Institution that issued the certificate
    address recipient;         // Certificate holder
    uint256 issuedAt;          // Timestamp
    string certificateType;    // e.g., "Hackathon", "Course", "Degree"
    bool revoked;              // Revocation status
}
```

**Roles**:
```solidity
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
```

**Functions**:

1. **issueCertificate**
   - Access: ISSUER_ROLE only
   - Parameters: `address recipient, string ipfsHash, string certificateType`
   - Returns: `uint256 certificateId`
   - Emits: `CertificateIssued(certificateId, issuer, recipient, ipfsHash)`
   - Logic: Mint ERC-1155 token (quantity: 1), store certificate data

2. **batchIssueCertificates**
   - Access: ISSUER_ROLE only
   - Parameters: `address[] recipients, string[] ipfsHashes, string certificateType`
   - Returns: `uint256[] certificateIds`
   - Emits: `BatchCertificateIssued(certificateIds, issuer, recipients)`
   - Logic: Gas-optimized batch minting

3. **verifyCertificate**
   - Access: Public (view)
   - Parameters: `uint256 certificateId`
   - Returns: `Certificate memory`
   - Logic: Return certificate details with revocation status

4. **revokeCertificate**
   - Access: ISSUER_ROLE (only original issuer)
   - Parameters: `uint256 certificateId`
   - Emits: `CertificateRevoked(certificateId, issuer)`
   - Logic: Mark certificate as revoked (don't burn token)

5. **authorizeInstitution**
   - Access: ADMIN_ROLE only
   - Parameters: `address institution`
   - Logic: Grant ISSUER_ROLE to institution address

6. **getCertificatesByInstitution**
   - Access: Public (view)
   - Parameters: `address institution`
   - Returns: `uint256[] memory`
   - Logic: Return all certificate IDs issued by institution

7. **getCertificatesByRecipient**
   - Access: Public (view)
   - Parameters: `address recipient`
   - Returns: `uint256[] memory`
   - Logic: Query ERC-1155 balance for all token IDs

8. **pause / unpause**
   - Access: PAUSER_ROLE only
   - Logic: Emergency stop mechanism

**Events**:
```solidity
event CertificateIssued(uint256 indexed certificateId, address indexed issuer, address indexed recipient, string ipfsHash);
event BatchCertificateIssued(uint256[] certificateIds, address indexed issuer, address[] recipients);
event CertificateRevoked(uint256 indexed certificateId, address indexed issuer);
event InstitutionAuthorized(address indexed institution);
```

**Security**:
- ReentrancyGuard on all state-changing functions
- AccessControl for role-based permissions
- Pausable for emergency stops
- Input validation (non-zero addresses, non-empty strings)

---

### 3.2 InstitutionRegistry.sol

**Purpose**: Manage institution registration and verification.

**State Variables**:
```solidity
mapping(address => Institution) public institutions;
mapping(address => bool) public verifiedInstitutions;
uint256 public institutionCount;
```

**Structs**:
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

**Functions**:

1. **registerInstitution**
   - Access: Public
   - Parameters: `string name, string logoIpfsHash, string contactInfo`
   - Emits: `InstitutionRegistered(institutionAddress, name)`
   - Logic: Store institution data, set verified=false

2. **verifyInstitution**
   - Access: ADMIN_ROLE only
   - Parameters: `address institution`
   - Emits: `InstitutionVerified(institution)`
   - Logic: Set verified=true, grant ISSUER_ROLE in CertificateRegistry

3. **updateInstitutionInfo**
   - Access: Institution owner only
   - Parameters: `string logoIpfsHash, string contactInfo`
   - Logic: Update mutable institution data

4. **getInstitution**
   - Access: Public (view)
   - Parameters: `address institution`
   - Returns: `Institution memory`

5. **incrementCertificateCount**
   - Access: CertificateRegistry only
   - Parameters: `address institution`
   - Logic: Called when certificate issued

**Events**:
```solidity
event InstitutionRegistered(address indexed institution, string name);
event InstitutionVerified(address indexed institution);
event InstitutionUpdated(address indexed institution);
```

---

### 3.3 TemplateManager.sol

**Purpose**: Manage certificate template designs.

**State Variables**:
```solidity
mapping(uint256 => Template) public templates;
uint256 public templateCounter;
mapping(address => uint256[]) public institutionTemplates;
```

**Structs**:
```solidity
struct Template {
    string ipfsHash;        // Template design file
    address creator;        // Institution that created it
    bool isPublic;          // Available to all institutions
    string category;        // e.g., "Hackathon", "Course"
    uint256 usageCount;
    uint256 createdAt;
}
```

**Functions**:

1. **createTemplate**
   - Access: ISSUER_ROLE only
   - Parameters: `string ipfsHash, bool isPublic, string category`
   - Returns: `uint256 templateId`
   - Emits: `TemplateCreated(templateId, creator)`

2. **getTemplate**
   - Access: Public (view)
   - Parameters: `uint256 templateId`
   - Returns: `Template memory`

3. **listPublicTemplates**
   - Access: Public (view)
   - Returns: `uint256[] memory`
   - Logic: Return IDs of all public templates

4. **getInstitutionTemplates**
   - Access: Public (view)
   - Parameters: `address institution`
   - Returns: `uint256[] memory`

5. **incrementUsageCount**
   - Access: CertificateRegistry only
   - Parameters: `uint256 templateId`

**Events**:
```solidity
event TemplateCreated(uint256 indexed templateId, address indexed creator);
event TemplateUsed(uint256 indexed templateId);
```

---

## 4. File Structure

```
certificate-platform/
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore file
├── foundry.toml                    # Foundry configuration
├── Makefile                        # Automation commands
├── README.md                       # Project documentation
├── remappings.txt                  # Dependency remappings
│
├── script/                         # Deployment scripts
│   ├── Deploy.s.sol                # Main deployment script
│   ├── DeployCertificateRegistry.s.sol
│   ├── DeployInstitutionRegistry.s.sol
│   └── DeployTemplateManager.s.sol
│
├── src/                            # Smart contracts
│   ├── CertificateRegistry.sol     # Main certificate contract
│   ├── InstitutionRegistry.sol     # Institution management
│   └── TemplateManager.sol         # Template management
│
├── test/                           # Test files
│   ├── CertificateRegistry.t.sol   # CertificateRegistry tests
│   ├── InstitutionRegistry.t.sol   # InstitutionRegistry tests
│   ├── TemplateManager.t.sol       # TemplateManager tests
│   └── Integration.t.sol           # Integration tests
│
├── lib/                            # Dependencies (git submodules)
│   ├── forge-std/                  # Foundry standard library
│   └── openzeppelin-contracts/     # OpenZeppelin contracts
│
├── out/                            # Compiled contracts (auto-generated)
│   ├── CertificateRegistry.sol/
│   │   └── CertificateRegistry.json
│   └── ...
│
├── broadcast/                      # Deployment artifacts (auto-generated)
│   └── Deploy.s.sol/
│       └── 11155111/               # Sepolia chainId
│           └── run-latest.json
│
├── abi/                            # Extracted ABIs for frontend
│   ├── CertificateRegistry.json
│   ├── InstitutionRegistry.json
│   └── TemplateManager.json
│
└── scripts/                        # Helper scripts
    ├── extract-abi.sh              # Extract ABIs from compiled contracts
    └── verify-contracts.sh         # Verify on Etherscan
```

---

## 5. Implementation Details

### 5.1 foundry.toml Configuration

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
test = "test"
cache_path = "cache"
script = "script"

# Solidity compiler settings
solc_version = "0.8.20"
evm_version = "paris"
optimizer = true
optimizer_runs = 200
via_ir = false

# Test settings
verbosity = 3
fuzz_runs = 256
fuzz_max_test_rejects = 65536

# Formatting
line_length = 120
tab_width = 4
bracket_spacing = true

# RPC endpoints (use environment variables)
[rpc_endpoints]
sepolia = "${SEPOLIA_RPC_URL}"
mainnet = "${MAINNET_RPC_URL}"

# Etherscan API keys
[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}" }

# Gas reporting
gas_reports = ["*"]

# Additional output for ABIs
extra_output = ["abi"]
extra_output_files = ["abi"]
```

---

### 5.2 .env.example

```bash
# RPC Endpoints
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Private Keys (NEVER commit .env file!)
DEPLOYER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
ADMIN_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# Etherscan API Key for contract verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Contract Addresses (populated after deployment)
CERTIFICATE_REGISTRY_ADDRESS=
INSTITUTION_REGISTRY_ADDRESS=
TEMPLATE_MANAGER_ADDRESS=

# Test Configuration
FORK_BLOCK_NUMBER=
TEST_INSTITUTION_ADDRESS=
TEST_RECIPIENT_ADDRESS=
```

**Security Notes**:
- Never commit `.env` file to version control
- Use `.env.example` as template
- Keep private keys in hardware wallet or secure key management system
- Rotate keys after hackathon/testing

---

### 5.3 Makefile

```makefile
# Load environment variables
-include .env

# Default target
.PHONY: help
help:
	@echo "Certificate Platform Smart Contracts - Makefile"
	@echo ""
	@echo "Available commands:"
	@echo "  make install           - Install dependencies"
	@echo "  make build             - Compile contracts"
	@echo "  make test              - Run all tests"
	@echo "  make test-coverage     - Run tests with coverage report"
	@echo "  make test-gas          - Run tests with gas report"
	@echo "  make deploy-sepolia    - Deploy to Sepolia testnet"
	@echo "  make verify-sepolia    - Verify contracts on Sepolia Etherscan"
	@echo "  make extract-abi       - Extract ABIs for frontend"
	@echo "  make clean             - Clean build artifacts"
	@echo "  make anvil             - Start local Anvil node"
	@echo "  make snapshot          - Generate gas snapshots"

# Install dependencies
.PHONY: install
install:
	forge install OpenZeppelin/openzeppelin-contracts --no-commit
	forge install foundry-rs/forge-std --no-commit

# Build contracts
.PHONY: build
build:
	forge build

# Clean build artifacts
.PHONY: clean
clean:
	forge clean
	rm -rf abi/

# Run all tests
.PHONY: test
test:
	forge test -vvv

# Run tests with coverage
.PHONY: test-coverage
coverage:
	forge coverage --report lcov
	forge coverage --report summary

# Run tests with gas report
.PHONY: test-gas
test-gas:
	forge test --gas-report

# Generate gas snapshots
.PHONY: snapshot
snapshot:
	forge snapshot

# Start local Anvil node
.PHONY: anvil
anvil:
	anvil --chain-id 31337

# Deploy to Sepolia testnet
.PHONY: deploy-sepolia
deploy-sepolia:
	@echo "Deploying to Sepolia testnet..."
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(DEPLOYER_PRIVATE_KEY) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvvv

# Deploy to local Anvil
.PHONY: deploy-local
deploy-local:
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url http://localhost:8545 \
		--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
		--broadcast

# Verify contracts on Sepolia Etherscan
.PHONY: verify-sepolia
verify-sepolia:
	@echo "Verifying CertificateRegistry..."
	forge verify-contract $(CERTIFICATE_REGISTRY_ADDRESS) \
		src/CertificateRegistry.sol:CertificateRegistry \
		--chain sepolia \
		--etherscan-api-key $(ETHERSCAN_API_KEY)
	@echo "Verifying InstitutionRegistry..."
	forge verify-contract $(INSTITUTION_REGISTRY_ADDRESS) \
		src/InstitutionRegistry.sol:InstitutionRegistry \
		--chain sepolia \
		--etherscan-api-key $(ETHERSCAN_API_KEY)
	@echo "Verifying TemplateManager..."
	forge verify-contract $(TEMPLATE_MANAGER_ADDRESS) \
		src/TemplateManager.sol:TemplateManager \
		--chain sepolia \
		--etherscan-api-key $(ETHERSCAN_API_KEY)

# Extract ABIs for frontend
.PHONY: extract-abi
extract-abi:
	@echo "Extracting ABIs for frontend..."
	@mkdir -p abi
	@jq '.abi' out/CertificateRegistry.sol/CertificateRegistry.json > abi/CertificateRegistry.json
	@jq '.abi' out/InstitutionRegistry.sol/InstitutionRegistry.json > abi/InstitutionRegistry.json
	@jq '.abi' out/TemplateManager.sol/TemplateManager.json > abi/TemplateManager.json
	@echo "ABIs extracted to abi/ directory"
	@echo "Contract addresses:"
	@echo "CertificateRegistry: $(CERTIFICATE_REGISTRY_ADDRESS)"
	@echo "InstitutionRegistry: $(INSTITUTION_REGISTRY_ADDRESS)"
	@echo "TemplateManager: $(TEMPLATE_MANAGER_ADDRESS)"

# Format code
.PHONY: format
format:
	forge fmt

# Lint code
.PHONY: lint
lint:
	forge fmt --check

# Run security analysis with Slither (requires slither installation)
.PHONY: slither
slither:
	slither . --config-file slither.config.json

# Full CI pipeline
.PHONY: ci
ci: build lint test coverage

# Quick development workflow
.PHONY: dev
dev: clean build test
```

---

### 5.4 Deploy.s.sol (Deployment Script)

**Purpose**: Deploy all contracts in correct order with proper initialization.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {CertificateRegistry} from "../src/CertificateRegistry.sol";
import {InstitutionRegistry} from "../src/InstitutionRegistry.sol";
import {TemplateManager} from "../src/TemplateManager.sol";

contract DeployScript is Script {
    // Deployment addresses (will be populated during deployment)
    CertificateRegistry public certificateRegistry;
    InstitutionRegistry public institutionRegistry;
    TemplateManager public templateManager;

    function run() external {
        // Load deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy InstitutionRegistry first (no dependencies)
        console.log("Deploying InstitutionRegistry...");
        institutionRegistry = new InstitutionRegistry(deployer);
        console.log("InstitutionRegistry deployed at:", address(institutionRegistry));

        // 2. Deploy TemplateManager
        console.log("Deploying TemplateManager...");
        templateManager = new TemplateManager(deployer);
        console.log("TemplateManager deployed at:", address(templateManager));

        // 3. Deploy CertificateRegistry (depends on InstitutionRegistry)
        console.log("Deploying CertificateRegistry...");
        certificateRegistry = new CertificateRegistry(
            address(institutionRegistry),
            deployer,
            "ipfs://base-uri/" // Base URI for metadata
        );
        console.log("CertificateRegistry deployed at:", address(certificateRegistry));

        // 4. Set up permissions and integrations
        console.log("Setting up permissions...");
        
        // Grant CertificateRegistry permission to update institution stats
        institutionRegistry.grantRole(
            institutionRegistry.REGISTRY_ROLE(),
            address(certificateRegistry)
        );

        // Grant TemplateManager permission to be called by CertificateRegistry
        templateManager.grantRole(
            templateManager.REGISTRY_ROLE(),
            address(certificateRegistry)
        );

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("InstitutionRegistry:", address(institutionRegistry));
        console.log("TemplateManager:", address(templateManager));
        console.log("CertificateRegistry:", address(certificateRegistry));
        console.log("Admin Address:", deployer);
        console.log("\nSave these addresses to your .env file!");
    }
}
```

**Deployment Process**:
1. Load deployer private key from environment
2. Deploy InstitutionRegistry (no dependencies)
3. Deploy TemplateManager (no dependencies)
4. Deploy CertificateRegistry (pass InstitutionRegistry address)
5. Set up cross-contract permissions
6. Log all addresses for .env file

**Usage**:
```bash
# Deploy to Sepolia
make deploy-sepolia

# Or manually
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv
```

---

## 6. Testing Requirements

### Test Coverage Goals
- **Minimum**: 90% line coverage
- **Target**: 95%+ coverage including edge cases
- **Critical Paths**: 100% coverage for minting, verification, revocation

### Test Categories

#### 6.1 Unit Tests (CertificateRegistry.t.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {CertificateRegistry} from "../src/CertificateRegistry.sol";
import {InstitutionRegistry} from "../src/InstitutionRegistry.sol";

contract CertificateRegistryTest is Test {
    CertificateRegistry public registry;
    InstitutionRegistry public instRegistry;
    
    address admin = address(1);
    address institution1 = address(2);
    address recipient1 = address(3);
    address unauthorized = address(4);

    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy contracts
        instRegistry = new InstitutionRegistry(admin);
        registry = new CertificateRegistry(
            address(instRegistry),
            admin,
            "ipfs://base/"
        );
        
        // Setup institution
        vm.stopPrank();
        vm.startPrank(institution1);
        instRegistry.registerInstitution("Test University", "logo-hash", "contact");
        vm.stopPrank();
        
        vm.prank(admin);
        instRegistry.verifyInstitution(institution1);
        
        vm.prank(admin);
        registry.grantRole(registry.ISSUER_ROLE(), institution1);
    }

    // Test: Successful certificate issuance
    function test_IssueCertificate_Success() public {
        vm.prank(institution1);
        uint256 certId = registry.issueCertificate(
            recipient1,
            "Qm123...",
            "Hackathon"
        );
        
        assertEq(certId, 1);
        assertEq(registry.balanceOf(recipient1, certId), 1);
        
        (string memory ipfsHash, address issuer, address recipient,,) = 
            registry.certificates(certId);
        assertEq(ipfsHash, "Qm123...");
        assertEq(issuer, institution1);
        assertEq(recipient, recipient1);
    }

    // Test: Unauthorized issuance should fail
    function test_IssueCertificate_Unauthorized_Reverts() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        registry.issueCertificate(recipient1, "Qm123...", "Hackathon");
    }

    // Test: Batch issuance
    function test_BatchIssueCertificates_Success() public {
        address[] memory recipients = new address[](3);
        recipients[0] = address(10);
        recipients[1] = address(11);
        recipients[2] = address(12);
        
        string[] memory hashes = new string[](3);
        hashes[0] = "Qm1...";
        hashes[1] = "Qm2...";
        hashes[2] = "Qm3...";
        
        vm.prank(institution1);
        uint256[] memory certIds = registry.batchIssueCertificates(
            recipients,
            hashes,
            "Course"
        );
        
        assertEq(certIds.length, 3);
        assertEq(registry.balanceOf(recipients[0], certIds[0]), 1);
    }

    // Test: Verification
    function test_VerifyCertificate_Success() public {
        vm.prank(institution1);
        uint256 certId = registry.issueCertificate(
            recipient1,
            "Qm123...",
            "Hackathon"
        );
        
        (string memory ipfsHash, address issuer,,,bool revoked) = 
            registry.verifyCertificate(certId);
        
        assertEq(ipfsHash, "Qm123...");
        assertEq(issuer, institution1);
        assertFalse(revoked);
    }

    // Test: Revocation
    function test_RevokeCertificate_Success() public {
        vm.prank(institution1);
        uint256 certId = registry.issueCertificate(
            recipient1,
            "Qm123...",
            "Hackathon"
        );
        
        vm.prank(institution1);
        registry.revokeCertificate(certId);
        
        (,,,,bool revoked) = registry.certificates(certId);
        assertTrue(revoked);
    }

    // Test: Only issuer can revoke
    function test_RevokeCertificate_OnlyIssuer_Reverts() public {
        vm.prank(institution1);
        uint256 certId = registry.issueCertificate(
            recipient1,
            "Qm123...",
            "Hackathon"
        );
        
        vm.prank(unauthorized);
        vm.expectRevert();
        registry.revokeCertificate(certId);
    }

    // Test: Empty IPFS hash should revert
    function test_IssueCertificate_EmptyHash_Reverts() public {
        vm.prank(institution1);
        vm.expectRevert("Empty IPFS hash");
        registry.issueCertificate(recipient1, "", "Hackathon");
    }

    // Test: Zero address recipient should revert
    function test_IssueCertificate_ZeroAddress_Reverts() public {
        vm.prank(institution1);
        vm.expectRevert("Zero address recipient");
        registry.issueCertificate(address(0), "Qm123...", "Hackathon");
    }

    // Fuzz test: Random certificate issuance
    function testFuzz_IssueCertificate(
        address recipient,
        string memory ipfsHash
    ) public {
        vm.assume(recipient != address(0));
        vm.assume(bytes(ipfsHash).length > 0);
        
        vm.prank(institution1);
        uint256 certId = registry.issueCertificate(
            recipient,
            ipfsHash,
            "Test"
        );
        
        assertGt(certId, 0);
        assertEq(registry.balanceOf(recipient, certId), 1);
    }

    // Gas benchmark: Single issuance
    function test_Gas_SingleIssuance() public {
        vm.prank(institution1);
        registry.issueCertificate(recipient1, "Qm123...", "Hackathon");
    }

    // Gas benchmark: Batch issuance (100 certificates)
    function test_Gas_BatchIssuance_100() public {
        address[] memory recipients = new address[](100);
        string[] memory hashes = new string[](100);
        
        for (uint i = 0; i < 100; i++) {
            recipients[i] = address(uint160(i + 100));
            hashes[i] = "Qm123...";
        }
        
        vm.prank(institution1);
        registry.batchIssueCertificates(recipients, hashes, "Hackathon");
    }
}
```

**Additional Test Files**:
- `InstitutionRegistry.t.sol`: Test institution registration, verification
- `TemplateManager.t.sol`: Test template creation, listing
- `Integration.t.sol`: Test cross-contract interactions
- `Security.t.sol`: Test reentrancy, access control, front-running

**Run Tests**:
```bash
# Run all tests
make test

# Run with gas report
make test-gas

# Run with coverage
make test-coverage

# Run specific test file
forge test --match-path test/CertificateRegistry.t.sol -vvv

# Run specific test function
forge test --match-test test_IssueCertificate_Success -vvvv
```

---

## 7. Deployment Instructions

### Pre-Deployment Checklist

✅ **Code Quality**
- [ ] All contracts compile without warnings
- [ ] Tests pass with 90%+ coverage
- [ ] Gas optimization completed
- [ ] Code formatted with `forge fmt`
- [ ] No hardcoded addresses or sensitive data

✅ **Security**
- [ ] Access control properly implemented
- [ ] Reentrancy guards in place
- [ ] Input validation on all functions
- [ ] Emergency pause mechanism tested
- [ ] No known vulnerabilities

✅ **Environment Setup**
- [ ] `.env` file configured with proper keys
- [ ] Sepolia RPC endpoint working
- [ ] Deployer wallet has sufficient Sepolia ETH
- [ ] Etherscan API key configured

✅ **Testing**
- [ ] Local deployment tested on Anvil
- [ ] All integration tests passed
- [ ] Gas costs reviewed and acceptable

### Deployment Steps

#### Step 1: Get Sepolia Testnet ETH

```bash
# Get Sepolia ETH from faucets:
# 1. Alchemy Sepolia Faucet: https://sepoliafaucet.com/
# 2. Chainlink Faucet: https://faucets.chain.link/sepolia
# 3. Infura Faucet: https://www.infura.io/faucet/sepolia

# Check your balance
cast balance $DEPLOYER_ADDRESS --rpc-url $SEPOLIA_RPC_URL
```

You need approximately **0.05 ETH** for deployment and testing.

#### Step 2: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your actual values
nano .env

# Test RPC connection
cast block-number --rpc-url $SEPOLIA_RPC_URL
```

#### Step 3: Compile Contracts

```bash
# Clean previous builds
make clean

# Compile contracts
make build

# Verify compilation
ls -la out/CertificateRegistry.sol/
```

#### Step 4: Run Tests on Fork

```bash
# Test against Sepolia fork (optional but recommended)
forge test --fork-url $SEPOLIA_RPC_URL -vvv

# If tests pass, proceed to deployment
```

#### Step 5: Deploy to Sepolia

```bash
# Deploy using Makefile (recommended)
make deploy-sepolia

# Or deploy manually with more control
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  -vvvv
```

**Expected Output**:
```
Deploying contracts with account: 0x...
Account balance: 50000000000000000
Deploying InstitutionRegistry...
InstitutionRegistry deployed at: 0x...
Deploying TemplateManager...
TemplateManager deployed at: 0x...
Deploying CertificateRegistry...
CertificateRegistry deployed at: 0x...
Setting up permissions...

=== Deployment Summary ===
InstitutionRegistry: 0xABC123...
TemplateManager: 0xDEF456...
CertificateRegistry: 0xGHI789...
Admin Address: 0x...

Transaction: 0x...
Block: 12345678
Gas Used: 3456789
```

#### Step 6: Save Contract Addresses

```bash
# Update .env file with deployed addresses
echo "CERTIFICATE_REGISTRY_ADDRESS=0xGHI789..." >> .env
echo "INSTITUTION_REGISTRY_ADDRESS=0xABC123..." >> .env
echo "TEMPLATE_MANAGER_ADDRESS=0xDEF456..." >> .env
```

#### Step 7: Verify Contracts on Etherscan

```bash
# Verify all contracts
make verify-sepolia

# Or verify individually
forge verify-contract $CERTIFICATE_REGISTRY_ADDRESS \
  src/CertificateRegistry.sol:CertificateRegistry \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,address,string)" $INSTITUTION_REGISTRY_ADDRESS $ADMIN_ADDRESS "ipfs://base/")
```

#### Step 8: Test Deployed Contracts

```bash
# Read contract data
cast call $CERTIFICATE_REGISTRY_ADDRESS "certificateCounter()" --rpc-url $SEPOLIA_RPC_URL

# Test certificate issuance (from authorized institution)
cast send $CERTIFICATE_REGISTRY_ADDRESS \
  "issueCertificate(address,string,string)" \
  $RECIPIENT_ADDRESS \
  "QmTest123..." \
  "Hackathon" \
  --private-key $INSTITUTION_PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL

# Verify certificate
cast call $CERTIFICATE_REGISTRY_ADDRESS \
  "verifyCertificate(uint256)" \
  1 \
  --rpc-url $SEPOLIA_RPC_URL
```

### Post-Deployment Checklist

✅ **Verification**
- [ ] All contracts verified on Sepolia Etherscan
- [ ] Contract source code visible and readable
- [ ] ABI matches compiled version

✅ **Functionality**
- [ ] Test certificate issuance works
- [ ] Verification function returns correct data
- [ ] Revocation works correctly
- [ ] Access control enforced

✅ **Documentation**
- [ ] Update README with deployed addresses
- [ ] Document admin/institution setup process
- [ ] Share contract addresses with frontend team

✅ **Monitoring**
- [ ] Monitor first transactions on Etherscan
- [ ] Check gas costs for operations
- [ ] Verify event emissions

---

## 8. ABI Export for Frontend

### Automatic ABI Extraction

The Makefile includes a command to extract clean ABIs for frontend integration:

```bash
# Extract ABIs after deployment
make extract-abi
```

This creates:
```
abi/
├── CertificateRegistry.json       # Clean ABI only
├── InstitutionRegistry.json
└── TemplateManager.json
```

### Manual ABI Extraction

If you need to extract ABIs manually:

```bash
# Using jq (JSON processor)
mkdir -p abi

# Extract CertificateRegistry ABI
jq '.abi' out/CertificateRegistry.sol/CertificateRegistry.json > abi/CertificateRegistry.json

# Extract InstitutionRegistry ABI
jq '.abi' out/InstitutionRegistry.sol/InstitutionRegistry.json > abi/InstitutionRegistry.json

# Extract TemplateManager ABI
jq '.abi' out/TemplateManager.sol/TemplateManager.json > abi/TemplateManager.json

# Verify ABIs are valid JSON
jq '.' abi/CertificateRegistry.json
```

### Alternative: Using Foundry Inspect

```bash
# Generate ABI directly from source
forge inspect src/CertificateRegistry.sol:CertificateRegistry abi > abi/CertificateRegistry.json

# Pretty print the ABI
forge inspect src/CertificateRegistry.sol:CertificateRegistry abi --pretty
```

### Create Frontend Integration Package

**Create `abi-package.json` for easy sharing**:

```json
{
  "contracts": {
    "CertificateRegistry": {
      "address": {
        "sepolia": "0xGHI789...",
        "mainnet": "0x..."
      },
      "abi": "... (paste ABI array here) ..."
    },
    "InstitutionRegistry": {
      "address": {
        "sepolia": "0xABC123...",
        "mainnet": "0x..."
      },
      "abi": "... (paste ABI array here) ..."
    },
    "TemplateManager": {
      "address": {
        "sepolia": "0xDEF456...",
        "mainnet": "0x..."
      },
      "abi": "... (paste ABI array here) ..."
    }
  },
  "deployedAt": "2025-10-25T20:00:00Z",
  "network": "sepolia",
  "chainId": 11155111
}
```

### Share with Frontend Team

**Option 1: Direct Files**
```bash
# Zip ABI files
zip -r abis-for-frontend.zip abi/ broadcast/

# Send to frontend developer
# Files include:
# - abi/*.json (clean ABIs)
# - broadcast/Deploy.s.sol/11155111/run-latest.json (deployment info)
```

**Option 2: NPM Package** (Advanced)
```bash
# Create package.json in abi/ directory
cd abi/
cat > package.json <<EOF
{
  "name": "certificate-platform-contracts",
  "version": "1.0.0",
  "description": "Smart contract ABIs for Certificate Platform",
  "main": "index.js",
  "files": ["*.json", "index.js"],
  "author": "Your Name",
  "license": "MIT"
}
EOF

# Create index.js exporting all ABIs
cat > index.js <<EOF
module.exports = {
  CertificateRegistry: require('./CertificateRegistry.json'),
  InstitutionRegistry: require('./InstitutionRegistry.json'),
  TemplateManager: require('./TemplateManager.json'),
  addresses: {
    sepolia: {
      CertificateRegistry: '0xGHI789...',
      InstitutionRegistry: '0xABC123...',
      TemplateManager: '0xDEF456...'
    }
  }
};
EOF

# Publish to npm or share as tarball
npm pack
# Share certificate-platform-contracts-1.0.0.tgz with frontend
```

**Option 3: Git Submodule** (Best for Teams)
```bash
# Create separate repo for ABIs
git init certificate-contracts-abi
cd certificate-contracts-abi/

# Copy ABIs
cp -r ../abi/* .

# Add deployment addresses
echo "CERTIFICATE_REGISTRY=0xGHI789..." > addresses.txt
echo "INSTITUTION_REGISTRY=0xABC123..." >> addresses.txt
echo "TEMPLATE_MANAGER=0xDEF456..." >> addresses.txt

# Commit and push
git add .
git commit -m "Add ABIs and addresses for Sepolia deployment"
git push origin main

# Frontend team can add as submodule
cd frontend/
git submodule add https://github.com/yourorg/certificate-contracts-abi.git contracts
```

### Frontend Integration Example (Wagmi v2)

Share this code snippet with your frontend developer:

```typescript
// contracts/CertificateRegistry.ts
import CertificateRegistryABI from './abi/CertificateRegistry.json';

export const certificateRegistryConfig = {
  address: '0xGHI789...' as `0x${string}`,
  abi: CertificateRegistryABI,
  chainId: 11155111, // Sepolia
} as const;

// Usage with Wagmi
import { useContractRead, useContractWrite } from 'wagmi';
import { certificateRegistryConfig } from './contracts/CertificateRegistry';

// Read certificate data
const { data: certificate } = useContractRead({
  ...certificateRegistryConfig,
  functionName: 'verifyCertificate',
  args: [certificateId],
});

// Issue certificate (write)
const { write: issueCertificate } = useContractWrite({
  ...certificateRegistryConfig,
  functionName: 'issueCertificate',
});
```

---

## 9. Security Checklist

### Smart Contract Security

✅ **Access Control**
- [ ] All privileged functions protected by role checks
- [ ] Role assignments follow principle of least privilege
- [ ] Admin functions properly restricted
- [ ] Multi-signature considered for critical operations

✅ **Input Validation**
- [ ] Non-zero address checks on all address parameters
- [ ] Non-empty string checks where applicable
- [ ] Array length validations in batch operations
- [ ] Numeric bounds checking

✅ **Reentrancy Protection**
- [ ] ReentrancyGuard applied to state-changing functions
- [ ] Checks-Effects-Interactions pattern followed
- [ ] No external calls before state updates

✅ **Integer Safety**
- [ ] No overflow/underflow vulnerabilities (Solidity 0.8+ has built-in protection)
- [ ] Safe arithmetic operations
- [ ] Counter increment protection

✅ **Event Emissions**
- [ ] All state changes emit events
- [ ] Events include indexed parameters for filtering
- [ ] Event data sufficient for off-chain tracking

✅ **Gas Optimization**
- [ ] Storage variables packed efficiently
- [ ] Use of calldata instead of memory where possible
- [ ] Batch operations optimized
- [ ] Unnecessary storage reads minimized

✅ **Emergency Controls**
- [ ] Pausable mechanism implemented
- [ ] Emergency stop tested
- [ ] Recovery procedures documented

### Deployment Security

✅ **Private Key Management**
- [ ] Private keys never committed to version control
- [ ] `.env` file in `.gitignore`
- [ ] Hardware wallet considered for mainnet
- [ ] Key rotation plan in place

✅ **Environment Variables**
- [ ] All sensitive data in environment variables
- [ ] `.env.example` provided without actual secrets
- [ ] Environment validation before deployment

✅ **Network Configuration**
- [ ] Correct RPC endpoint configured
- [ ] Chain ID verified
- [ ] Gas price settings appropriate

### Post-Deployment Security

✅ **Monitoring**
- [ ] Transaction monitoring set up
- [ ] Alert system for unusual activity
- [ ] Gas spending tracked

✅ **Upgrades**
- [ ] Upgrade path documented (even if not using proxy pattern)
- [ ] Emergency response plan
- [ ] Contact information for security issues

---

## 10. Reference Projects

### Inspiration Sources

#### 10.1 Certificate Verification Projects

**BlockCertify** (Polygon-based)
- GitHub: https://github.com/SBasu-7870/BlockCertify
- Features: Merkle tree structure, Firebase integration
- Key Learnings: Root hash verification pattern

**E-Certify** (Ethereum + IPFS)
- GitHub: https://github.com/nikhildsahu/E-Certify
- Features: Multi-sig wallets for students, React frontend
- Key Learnings: Issuer-only upload pattern

**Certoshi** (Ethereum)
- GitHub: https://github.com/thawalk/Certoshi
- Features: Decentralized issuance and verification
- Key Learnings: Simple verification UI

**Academic-Verify** (Educational certificates)
- GitHub: https://github.com/sanyabhanot/Academic-verify
- Features: Online course certificates
- Key Learnings: Batch processing for courses

#### 10.2 Foundry Templates

**PaulRBerg Foundry Template**
- GitHub: https://github.com/PaulRBerg/foundry-template
- Features: Solhint, Prettier, CI/CD
- Usage: Industry-standard Foundry setup

**HiFi Foundry Template**
- GitHub: https://github.com/hifi-finance/foundry-template
- Features: Makefile, conventional commits
- Usage: Clean deployment scripts

#### 10.3 ERC-1155 Implementations

**OpenZeppelin ERC-1155**
- Docs: https://docs.openzeppelin.com/contracts/3.x/erc1155
- Features: Battle-tested, audited implementation
- Usage: Base for CertificateRegistry

**BNB Smart Chain BEP-1155 Example**
- Guide: https://docs.chainstack.com/docs/bsc-tutorial-bep-1155-contract-with-truffle-and-openzeppelin
- Features: Fungible + Non-fungible in one contract
- Usage: Multi-token pattern reference

#### 10.4 Best Practices Resources

**Foundry Documentation**
- https://book.getfoundry.sh/
- Essential reading for all Foundry features

**Smart Contract Security Best Practices**
- https://consensys.github.io/smart-contract-best-practices/
- Comprehensive security guide

**Solidity Style Guide**
- https://docs.soliditylang.org/en/latest/style-guide.html
- Official coding conventions

**Cyfrin Updraft (Patrick Collins)**
- https://updraft.cyfrin.io/courses/foundry
- Excellent Foundry course with deployment examples

---

## Implementation Instructions for AI Agent

### Phase 1: Project Setup (Priority 1)

```bash
# Create project structure
mkdir -p src test script abi lib

# Initialize Foundry (already done)
# forge init

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit

# Create configuration files
# - foundry.toml (from Section 5.1)
# - .env.example (from Section 5.2)
# - Makefile (from Section 5.3)
# - .gitignore
```

### Phase 2: Smart Contract Development (Priority 1)

**Order of Implementation**:

1. **InstitutionRegistry.sol** (Simplest, no dependencies)
   - Implement struct Institution
   - Implement registerInstitution()
   - Implement verifyInstitution()
   - Add AccessControl
   - Add events

2. **TemplateManager.sol** (Simple, no dependencies)
   - Implement struct Template
   - Implement createTemplate()
   - Implement getTemplate()
   - Add AccessControl

3. **CertificateRegistry.sol** (Most complex, depends on others)
   - Import ERC1155 from OpenZeppelin
   - Implement struct Certificate
   - Implement issueCertificate()
   - Implement batchIssueCertificates()
   - Implement verifyCertificate()
   - Implement revokeCertificate()
   - Add AccessControl, ReentrancyGuard, Pausable
   - Add comprehensive events

**Implementation Checklist per Contract**:
- [ ] SPDX license identifier
- [ ] Pragma statement
- [ ] Import statements
- [ ] NatSpec documentation
- [ ] State variables
- [ ] Events
- [ ] Constructor
- [ ] Public functions
- [ ] Internal functions
- [ ] View functions
- [ ] Access modifiers
- [ ] Error handling

### Phase 3: Test Development (Priority 1)

**Test each contract thoroughly**:

1. Write `InstitutionRegistry.t.sol`
   - Test registration
   - Test verification
   - Test access control

2. Write `TemplateManager.t.sol`
   - Test template creation
   - Test public/private templates

3. Write `CertificateRegistry.t.sol`
   - Test issuance (single and batch)
   - Test verification
   - Test revocation
   - Test access control
   - Fuzz tests
   - Gas benchmarks

4. Write `Integration.t.sol`
   - Test cross-contract interactions
   - Test full certificate lifecycle

**Run tests continuously**:
```bash
forge test -vvv
forge coverage
forge snapshot
```

### Phase 4: Deployment Scripts (Priority 2)

1. Create `script/Deploy.s.sol` (from Section 5.4)
   - Deploy in correct order
   - Set up permissions
   - Log addresses

2. Test deployment locally:
```bash
# Start Anvil
make anvil

# Deploy to local network
make deploy-local
```

### Phase 5: Deployment to Sepolia (Priority 2)

1. Configure `.env` with real values
2. Get Sepolia ETH from faucets
3. Deploy:
```bash
make deploy-sepolia
```
4. Verify contracts:
```bash
make verify-sepolia
```

### Phase 6: ABI Export (Priority 3)

1. Extract ABIs:
```bash
make extract-abi
```

2. Create `abi-package.json` with addresses

3. Share with frontend team

### Phase 7: Documentation (Priority 3)

1. Update README.md with:
   - Deployed contract addresses
   - Setup instructions
   - Usage examples
   - Testing guide

2. Document deployment process

3. Create frontend integration guide

---

## Success Criteria for AI Agent

**✅ Smart Contracts**
- [ ] All 3 contracts compile without errors or warnings
- [ ] NatSpec documentation complete
- [ ] Gas-optimized code

**✅ Testing**
- [ ] All tests pass
- [ ] 90%+ code coverage
- [ ] Gas benchmarks generated
- [ ] No security vulnerabilities

**✅ Deployment**
- [ ] Successful Sepolia deployment
- [ ] All contracts verified on Etherscan
- [ ] Deployment addresses saved

**✅ Integration**
- [ ] Clean ABIs extracted
- [ ] Contract addresses documented
- [ ] Frontend integration guide created

**✅ Documentation**
- [ ] Comprehensive README
- [ ] Code comments and NatSpec
- [ ] Usage examples

---

## Timeline (24-Hour Hackathon)

**Hours 0-2**: Setup + InstitutionRegistry  
**Hours 2-4**: TemplateManager + Tests  
**Hours 4-8**: CertificateRegistry (core functionality)  
**Hours 8-10**: CertificateRegistry (batch + advanced features)  
**Hours 10-12**: Comprehensive testing  
**Hours 12-14**: Deployment scripts  
**Hours 14-16**: Local testing + bug fixes  
**Hours 16-18**: Sepolia deployment  
**Hours 18-20**: Verification + ABI export  
**Hours 20-22**: Documentation  
**Hours 22-24**: Final testing + handoff to frontend

---

## Emergency Contacts & Resources

**Foundry Help**:
- Documentation: https://book.getfoundry.sh/
- GitHub: https://github.com/foundry-rs/foundry
- Discord: https://discord.gg/foundry

**OpenZeppelin**:
- Contracts: https://docs.openzeppelin.com/contracts/
- Forum: https://forum.openzeppelin.com/

**Sepolia Faucets**:
- Alchemy: https://sepoliafaucet.com/
- Chainlink: https://faucets.chain.link/sepolia
- Infura: https://www.infura.io/faucet/sepolia

**Block Explorer**:
- Sepolia Etherscan: https://sepolia.etherscan.io/

---

## Appendix: Quick Reference Commands

```bash
# Compilation
forge build
forge clean

# Testing
forge test -vvv
forge test --match-test test_IssueCertificate_Success -vvvv
forge coverage
forge snapshot

# Deployment
make deploy-sepolia
make deploy-local

# Verification
make verify-sepolia

# ABI Export
make extract-abi

# Utilities
forge fmt                    # Format code
forge inspect <contract> abi # Get ABI
cast balance <address>       # Check balance
cast call <address> "fn()"   # Call view function
cast send <address> "fn()"   # Send transaction
```

---

**END OF PRD**

This document provides complete specifications for AI agent to implement the certificate verification smart contracts. Follow the phases sequentially, test thoroughly, and deploy successfully!
