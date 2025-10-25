# 🔐 Certificate Verification Platform

Smart contract suite for issuing, managing, and verifying blockchain-backed certificates. Built with **Foundry** and aligned to the [Product Requirements Document](PRD-SmartContracts.md) for Sepolia deployment.

---

## ✨ Overview
- **Language & Tooling:** Solidity ^0.8.20 · Foundry · forge-std · OpenZeppelin Contracts v5
- **Token Standard:** ERC-1155 (1 unique token ID per certificate)
- **Core Roles:** `ADMIN`, `ISSUER`, `PAUSER`, `REGISTRY`
- **Metadata:** IPFS hashes for certificate + template payloads stored on-chain

---

## 🧱 Architecture
```
InstitutionRegistry ──────┐
								  ├─▶ CertificateRegistry (ERC-1155)
TemplateManager ──────────┘
```
- **InstitutionRegistry.sol** — Registers institutions, manages verification, tracks issuance counts.
- **TemplateManager.sol** — Stores certificate templates, controls visibility, increments usage metrics.
- **CertificateRegistry.sol** — Issues, verifies, and revokes certificates while linking institutions + templates.

---

## 🚀 Features
- Automated issuer authorization triggered by institution verification.
- Batch certificate issuance and template linkage in a single transaction.
- Reentrancy guard plus pause switch for emergency halts.
- Makefile targets for gas reporting, coverage, ABI extraction, and deployment.

---

## 📁 Project Structure
```
├── src/
│   ├── CertificateRegistry.sol
│   ├── InstitutionRegistry.sol
│   └── TemplateManager.sol
├── test/
│   ├── CertificateRegistry.t.sol
│   ├── InstitutionRegistry.t.sol
│   ├── TemplateManager.t.sol
│   └── Integration.t.sol
├── script/Deploy.s.sol
├── Makefile
├── foundry.toml
├── remappings.txt
├── .env.example
└── PRD-SmartContracts.md
```

---

## ⚡ Quick Start
```bash
# Install dependencies
make install

# Prepare environment variables
cp .env.example .env
# (edit .env with RPC URLs, private keys, Etherscan API key)

# Compile & test
make build
make test
```

### Requirements
- [Foundry toolchain](https://book.getfoundry.sh/getting-started/installation)
- RPC provider for Sepolia/Mainnet (Alchemy, Infura, etc.)
- `jq` CLI for ABI extraction (`sudo apt install jq` on Debian/Ubuntu)

---

## 🔧 Environment Variables
Populate `.env` before broadcasting:
- `SEPOLIA_RPC_URL` / `MAINNET_RPC_URL`
- `DEPLOYER_PRIVATE_KEY` / `ADMIN_PRIVATE_KEY`
- `ETHERSCAN_API_KEY`
- Contract address placeholders populate after deployment

Details for each variable live in [.env.example](.env.example).

---

## 🛠️ Development Workflow
| Command               | Description                                                   |
|-----------------------|---------------------------------------------------------------|
| `make build`          | Compile all smart contracts.                                  |
| `make test`           | Run unit + integration tests (verbose).                       |
| `make test-gas`       | Print gas usage for each test.                                |
| `make coverage`       | Generate lcov + summary coverage reports.                     |
| `make snapshot`       | Capture gas snapshots for regressions.                        |
| `make format`         | Apply `forge fmt` formatting.                                 |

---

## 🧪 Testing Strategy
- `InstitutionRegistry.t.sol` — Institution lifecycle, verification, issuance counters.
- `TemplateManager.t.sol` — Template creation, listings, usage increments.
- `CertificateRegistry.t.sol` — Single/batch issuance, template linkage, revocation, pause logic.
- `Integration.t.sol` — End-to-end lifecycle across all contracts.

The suite targets ≥90% coverage as defined in the PRD; extend with fuzzing or invariants if needed.

---

## 🚢 Deployment Guide
1. Fund the deployer wallet with Sepolia ETH.
2. Local dry-run:
	```bash
	make deploy-local
	```
3. Deploy to Sepolia:
	```bash
	make deploy-sepolia
	```
4. Verify contracts on Etherscan:
	```bash
	make verify-sepolia
	```
5. Update `.env` with emitted contract addresses for downstream tooling.

`script/Deploy.s.sol` deploys contracts in order, grants REGISTRY roles, and wires in the template manager.

---

## 📤 ABI Export
```bash
make extract-abi
```
Emits clean ABIs into `abi/` (ignored by Git) for frontend or SDK consumption.

---

## 🔒 Security Checklist
- ✅ `AccessControl` protects privileged operations.
- ✅ `ReentrancyGuard` + `Pausable` shield state transitions.
- ✅ Input validation rejects zero addresses / empty hashes.
- ✅ Template usage counters increment only via registry-authorized calls.
- 🔒 Never commit private keys; rotate testing keys after use.

---

## 📚 References
- [Product Requirements Document](PRD-SmartContracts.md)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts v5 Docs](https://docs.openzeppelin.com/contracts/5.x/)

> Looking to extend the stack? Add Slither analysis (`make slither`), wire Forge tasks into CI, or pipe ABI artifacts into your frontend build pipeline.
