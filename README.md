# 🛡️ Certificate Verification Platform## Foundry

Smart contracts for issuing and validating tamper-proof certificates on Ethereum. Built with Foundry, secured with OpenZeppelin, and tailored to the platform PRD for Sepolia deployments.**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

---Foundry consists of:

## 🔍 Quick Facts- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).

- **Language & Tooling:** Solidity ^0.8.20 · Foundry · forge-std · OpenZeppelin Contracts v5- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.

- **Token Model:** ERC-1155 (1 token ID per certificate instance)- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.

- **Core Roles:** ADMIN · ISSUER · PAUSER · REGISTRY- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

- **Storage:** On-chain hashes pointing to IPFS-hosted metadata & templates

## Documentation

---

https://book.getfoundry.sh/

## 🧱 Architecture Overview

````````## Usage

InstitutionRegistry ──┐

                      ├─▶ CertificateRegistry (ERC-1155)### Build

TemplateManager  ─────┘

```````shell

- `InstitutionRegistry.sol` — Onboards, verifies, and tracks issuing institutions.# Certificate Verification Platform — Smart Contracts

- `TemplateManager.sol` — Catalogues certificate templates and usage metrics.

- `CertificateRegistry.sol` — Issues, verifies, and revokes certificates while linking templates.This repository contains the smart contracts for a blockchain-backed certificate verification platform. Certificates are issued as ERC-1155 tokens, institutions are onboarded via role-based access control, and certificate templates are managed with IPFS references.



---## Contracts



## ✨ Feature Highlights- `src/InstitutionRegistry.sol` – Manages institution registration, verification, and issuance metrics.

- Automated issuer authorization once an institution passes verification.- `src/TemplateManager.sol` – Handles certificate template creation, discovery, and usage tracking.

- Batch certificate issuance (single transaction, many recipients) with optional template mapping.- `src/CertificateRegistry.sol` – Core ERC-1155 certificate issuance, verification, revocation, and template linkage.

- Pausable emergency stop, reentrancy protection, and detailed event logs.

- Gas reporting, coverage analysis, and ABI extraction available via Makefile targets.## Prerequisites



---- [Foundry](https://book.getfoundry.sh/getting-started/installation) toolchain installed

- Node with access to Sepolia RPC endpoint (for deployment)

## 📦 Repository Layout- jq (for ABI extraction)

````````

├── src/## Quick Start

│ ├── CertificateRegistry.sol

│ ├── InstitutionRegistry.sol```bash

│ └── TemplateManager.solmake install # Install OpenZeppelin and forge-std dependencies

├── test/cp .env.example .env # Populate RPC URLs, private keys, and API keys

│ ├── CertificateRegistry.t.solmake build # Compile contracts

│ ├── InstitutionRegistry.t.solmake test # Execute unit and integration tests

│ ├── TemplateManager.t.sol````

│ └── Integration.t.sol

├── script/Deploy.s.sol## Useful Commands

├── Makefile

├── foundry.toml| Command | Description |

├── remappings.txt| --------------------- | -------------------------------------------------------------- |

├── .env.example| `make test-gas` | Run the test suite with Forge gas reporting enabled. |

└── PRD-SmartContracts.md| `make coverage` | Produce lcov and summary coverage reports. |

```| `make deploy-local` | Deploy contracts to a local Anvil network for manual testing. |

| `make deploy-sepolia` | Deploy the full stack to Sepolia using configured credentials. |

---| `make verify-sepolia` | Verify deployed contracts on Sepolia Etherscan. |

| `make extract-abi` | Export contract ABIs into `abi/` for frontend integration. |

## 🚀 Getting Started

``````bash## Deployment Flow

# Install dependencies

make install1. Configure `.env` with RPC URLs, deployer keys, and Etherscan API key (see `.env.example`).

2. Ensure the deployer wallet holds sufficient Sepolia ETH (`cast balance $DEPLOYER_ADDRESS`).

# Copy & populate environment variables`````markdown

cp .env.example .env# 🛡️ Certificate Verification Platform



# Compile & run testsSmart contracts for issuing, managing, and verifying tamper-proof certificates on Ethereum. Built with Foundry, aligned with the project PRD, and ready for Sepolia deployments.

make build

make test---

``````

## 🔍 At a Glance

### Requirements- **Tech Stack:** Solidity ^0.8.20 · Foundry · OpenZeppelin Contracts v5

- [Foundry toolchain](https://book.getfoundry.sh/getting-started/installation)- **Token Standard:** ERC-1155 (one token ID per certificate)

- Access to a Sepolia/Mainnet RPC provider (Alchemy, Infura, etc.)- **Core Roles:** ADMIN · ISSUER · PAUSER · REGISTRY

- `jq` CLI for ABI extraction (`sudo apt install jq` on Debian/Ubuntu)- **Storage:** IPFS metadata links per certificate & template

---

## ⚙️ Environment Setup## 🧱 Architecture

Set real values in `.env` before live deployments:```

- `SEPOLIA_RPC_URL` / `MAINNET_RPC_URL` — network RPC endpoints.InstitutionRegistry ──┐

- `DEPLOYER_PRIVATE_KEY` / `ADMIN_PRIVATE_KEY` — private keys (never commit). ├─▶ CertificateRegistry (ERC-1155)

- `ETHERSCAN_API_KEY` — required for contract verification.TemplateManager ──────┘

- Contract address placeholders auto-populate post-deploy.```

- `InstitutionRegistry.sol` — Onboards and verifies institutions, tracks issuance counts.

See [.env.example](.env.example) for field descriptions.- `TemplateManager.sol` — Stores template metadata and usage stats.

- `CertificateRegistry.sol` — Issues, verifies, and revokes certificates; links to templates.

---

---

## 🧑‍💻 Development Workflow

| Command | Description |## ✨ Key Features

|-----------------------|---------------------------------------------------------------|- Role-based access control with automatic issuer authorization post-verification.

| `make build` | Compile smart contracts. |- Batch certificate issuance (single call → many recipients) with template linkage.

| `make test` | Run unit + integration tests with verbose logs. |- Reentrancy protection, pausable emergency stop, and granular event logging.

| `make test-gas` | Output gas usage per test. |- Gas reporting, coverage tooling, and ABI extraction baked into the workflow.

| `make coverage` | Generate lcov + summary coverage reports. |

| `make snapshot` | Capture gas snapshots for regression tracking. |---

| `make format` | Apply `forge fmt` to the codebase. |

## 📂 Project Structure

---```

├── src/

## 🧪 Testing Strategy│ ├── CertificateRegistry.sol

- **InstitutionRegistry.t.sol** — Registration, verification, and issuance statistics.│ ├── InstitutionRegistry.sol

- **TemplateManager.t.sol** — Template creation, visibility, and usage increments.│ └── TemplateManager.sol

- **CertificateRegistry.t.sol** — Single/batch issuance, template linkage, revocation, and pause logic.├── test/

- **Integration.t.sol** — End‑to‑end journey across all three contracts.│ ├── CertificateRegistry.t.sol

│ ├── InstitutionRegistry.t.sol

The suite is designed to meet the PRD goal of ≥90% coverage; extend with fuzzing or invariants as needed.│ ├── TemplateManager.t.sol

│ └── Integration.t.sol

---├── script/Deploy.s.sol

├── Makefile

## 📦 Deployment Guide├── foundry.toml

1. Fund the deployer wallet with Sepolia ETH.├── remappings.txt

2. Dry-run locally:├── .env.example

   ````bash└── PRD-SmartContracts.md

   make deploy-local```

   ````

3. Deploy to Sepolia:---

   ```````bash

   make deploy-sepolia## 🚀 Getting Started

   ``````bash

   ```````

4. Verify contracts:# Install dependencies

   ````bashmake install

   make verify-sepolia

   ```# Copy & populate environment variables

   ````

5. Update `.env` with the emitted contract addresses for future scripts.cp .env.example .env

The scripted deploy (`script/Deploy.s.sol`) wires the contracts in order, grants REGISTRY roles, and sets the active template manager.# Compile & test

make build

---make test

````

## 🧾 ABI Export

```bash### Requirements

make extract-abi- [Foundry toolchain](https://book.getfoundry.sh/getting-started/installation)

```- Access to Sepolia/Mainnet RPC endpoints (Alchemy, Infura, etc.)

Generates clean ABIs under `abi/` (ignored by Git) for frontend or SDK integration.- `jq` CLI for ABI extraction (`sudo apt install jq` on Debian/Ubuntu)



------



## 🔒 Security Checklist## ⚙️ Environment Variables

- ✅ AccessControl enforces admin/issuer permissions.Fill in `.env` with real values before live interactions:

- ✅ ReentrancyGuard and Pausable protect state-changing flows.- `SEPOLIA_RPC_URL`, `MAINNET_RPC_URL` — RPC endpoints.

- ✅ Input validation blocks empty strings and zero-address targets.- `DEPLOYER_PRIVATE_KEY`, `ADMIN_PRIVATE_KEY` — never commit; use secure wallets.

- ✅ Template usage increases only via authorized registry calls.- `ETHERSCAN_API_KEY` — required for verification.

- 🔒 Always keep private keys outside source control and rotate after testing.- Contract address placeholders populate after deployment.



---Need details on each field? See the comments in [.env.example](.env.example).



## 📚 References---

- [Product Requirements Document](PRD-SmartContracts.md)

- [Foundry Book](https://book.getfoundry.sh/)## 🧑‍💻 Development Workflow

- [OpenZeppelin Contracts v5](https://docs.openzeppelin.com/contracts/5.x/)| Command               | Description                                                   |

|-----------------------|---------------------------------------------------------------|

> _Looking for next steps?_ Integrate Slither (`make slither`), add CI for Forge pipelines, or wire ABI outputs into your frontend build.| `make build`          | Compile all contracts.                                        |

| `make test`           | Run unit + integration tests with verbose logs.               |
| `make test-gas`       | Run tests and print gas usage reports.                        |
| `make coverage`       | Generate coverage (lcov + summary).                           |
| `make snapshot`       | Capture gas snapshots for regressions.                        |
| `make format`         | Apply `forge fmt` formatting.                                 |

---

## 🧪 Testing Strategy
- **InstitutionRegistry.t.sol** — Registration, verification, updates, and role gating.
- **TemplateManager.t.sol** — Template creation, listings, and usage increments.
- **CertificateRegistry.t.sol** — Issuance (single/batch), template linking, revocation, pause logic.
- **Integration.t.sol** — Happy-path lifecycle across all contracts.

Target coverage matches the PRD goal (≥90%). Extend with fuzzing or invariant tests as needed.

---

## 📦 Deployment Guide
1. Fund the deployer wallet with Sepolia ETH.
2. Dry-run locally:
   ```bash
   make deploy-local
````

3. Deploy to Sepolia:
   ```bash
   make deploy-sepolia
   ```
4. Verify on Etherscan:
   ```bash
   make verify-sepolia
   ```
5. Update `.env` with deployed addresses for easy reuse.

The scripted deploy (`script/Deploy.s.sol`) wires contracts in order, grants REGISTRY roles, and sets the template manager pointer.

---

## 🧾 ABI Export

Extract clean ABIs for the frontend:

```bash
make extract-abi
```

Artifacts land in `abi/` (ignored by Git) for easy consumption by dApps or SDKs.

---

## 🔒 Security Checklist

- ✅ AccessControl gates admin/issuer actions.
- ✅ ReentrancyGuard + Pausable guard critical flows.
- ✅ Input validation prevents empty strings & zero addresses.
- ✅ Template usage only increments via authorized registry calls.
- 🔒 Keep private keys out of source control; rotate after testing.

---

## 📚 References

- [Product Requirements Document](PRD-SmartContracts.md)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts v5](https://docs.openzeppelin.com/contracts/5.x/)

> _Want to go further?_ Consider adding Slither analysis (`make slither`), integrating CI for Forge workflows, or wiring ABI exports directly into your frontend build.

```

```
