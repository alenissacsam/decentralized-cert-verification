# Decentralized Certificate Verification Platform

**On-Chain Addresses (Sepolia Testnet)**

- `CertificateRegistry` — `0xe38C32FC0290ceb5189d4dF130c37d0C82ce876f`
- `InstitutionRegistry` — `0xD4C4cc66c7FF23260287dc3a3985AA5f6bA7b059`
- `TemplateManager` — `0x5D61562121d28b772e4f782DC12f61FfCbd861ad`
- `NameRegistry` — `0xAD96F1220a5Ead242ED3ec774a9FB59e157d8520`

A Foundry-based smart contract suite that issues, manages, and verifies non-transferable certificates on-chain. Institutions can self-register, create reusable certificate templates, mint single or batch certificates, and publish human-readable names so client apps can present wallet owners cleanly.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Smart Contracts](#smart-contracts)
- [System Workflow](#system-workflow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing & Coverage](#testing--coverage)
- [Deployment](#deployment)
- [Interacting On-Chain](#interacting-on-chain)
- [Project Structure](#project-structure)
- [Support](#support)

## Architecture Overview

```
Institution Wallet        CertificateRegistry (ERC-1155)        Recipient Wallet
        │                           │                                 │
        │ register                  │                                 │
        ├──────────────────────────▶│                                 │
        │                           │ issue certificate (non-transferable)
        │                           ├────────────────────────────────►│
        │                           │                                 │
        │ create template           │                                 │
        ├──────────────────────────▶│  TemplateManager ◀──────────────┘
        │                           │ (usage stats, public catalog)
        │ set display name          │
        └──────────────────────────▶ NameRegistry (address ➜ name)
```

Everything is open-access to streamline hackathon and demo flows. Institutions auto-verify on registration, and a soulbound ERC-1155 design prevents certificate transfers.

## Key Features

- **Soulbound Certificates** – ERC-1155 tokens with transfers and approvals disabled.
- **Institution Self-Service** – Wallets register, auto-verify, and update branding on-chain.
- **Template Catalog** – Store reusable certificate templates, mark them public, and track usage metrics.
- **Batch Issuance** – Mint certificates to multiple recipients in a single transaction, with optional template linkage per recipient.
- **Name Registry** – Map wallet addresses to human-readable display names for UI consumption.
- **Scriptable Tooling** – Makefile targets wrap Foundry scripts for repeatable interactions and deployments.
- **Full Test Coverage** – Unit and integration suites cover all critical flows with `forge test` and `forge coverage` support.

## Smart Contracts

| Contract              | Responsibility                          | Highlights                                                                                                |
| --------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `CertificateRegistry` | ERC-1155 certificate minting & metadata | Issues single/batch certificates, links templates, revokes without burning, enforces non-transferability. |
| `InstitutionRegistry` | Institution onboarding & verification   | Auto-verifies new registrants, tracks issuance counts, exposes read APIs for frontends.                   |
| `TemplateManager`     | Certificate template lifecycle          | Creates templates (private/public), lists catalogs, increments usage when linked during issuance.         |
| `NameRegistry`        | Human-readable wallet names             | Let wallets set/clear a display name that UIs can read without additional off-chain services.             |

### CertificateRegistry Highlights

- `_issueCertificateInternal` mints the ERC-1155 token, updates issuer/recipient indexes, and notifies `InstitutionRegistry`.
- `_update` override reverts any transfer or approval attempt, making certificates non-transferable.
- `batchIssueCertificatesWithTemplates` allows each recipient to reference a different template in a single call.

### InstitutionRegistry Highlights

- `registerInstitution` saves branding metadata and auto-enables `verifiedInstitutions` for the caller.
- `verifyInstitution` remains available for manual verification if governance later adds constraints.
- `incrementCertificateCount` is only callable by the certificate registry to maintain accurate issuance metrics.

### TemplateManager Highlights

- `createTemplate` stores template metadata (IPFS hash, category, creator) and optionally exposes it publicly.
- `listPublicTemplates` returns IDs open for anyone to reuse.
- `incrementUsageCount` is invoked by the certificate registry whenever a template is applied.

### NameRegistry Highlights

- `setName`/`clearName` let wallets self-manage the string presented to users.
- `getName` is read-only for UIs to resolve wallet addresses.

## System Workflow

1. **Institution Onboarding** – A wallet calls `registerInstitution` with name, logo CID, and contact info. It is instantly considered verified.
2. **Template Creation (optional)** – Institutions create reusable templates with category tags (e.g., "Hackathon", "Course").
3. **Certificate Issuance** – Issuers mint certificates to recipients either individually or in batches. Each certificate can optionally reference a template.
4. **Recipient Experience** – Recipients hold a non-transferable token tied to IPFS metadata (frontends resolve via ERC-1155 `uri`).
5. **Name Resolution** – Institutions or recipients can register display names in `NameRegistry` for improved UX in dApps.

## Getting Started

### Prerequisites

- [Foundry](https://github.com/foundry-rs/foundry) (forge + cast)
- Node.js (optional, for the accompanying frontend in `frontend/`)
- Git, curl, and jq (for Makefile utilities)

### Installation

```bash
# Clone the repository
git clone https://github.com/alenissacsam/decentralized-cert-verification.git
cd decentralized-cert-verification

# Install solidity dependencies
forge install

# (Optional) Install frontend dependencies
cd frontend && npm install && cd ..
```

## Environment Variables

Copy `.env.example` to `.env` (if provided) or set the following manually:

```bash
# RPC URLs
touch .env
cat <<'EOF' > .env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/KEY

# Private keys (never commit!)
DEPLOYER_PRIVATE_KEY=0x...
ADMIN_PRIVATE_KEY=0x...
CALLER_PRIVATE_KEY=0x...

# Optional verification & convenience
BLOCKSCOUT_API_KEY=https://eth-sepolia.blockscout.com/api
CERTIFICATE_REGISTRY_ADDRESS=0x...
INSTITUTION_REGISTRY_ADDRESS=0x...
TEMPLATE_MANAGER_ADDRESS=0x...
NAME_REGISTRY_ADDRESS=0x...
EOF
```

The Makefile automatically loads `.env` for tasks.

## Testing & Coverage

```bash
# Run the full Foundry test suite
forge test

# Gas snapshot
forge snapshot

# Coverage outputs lcov + summary reports
forge coverage --report lcov
forge coverage --report summary
```

The generated `lcov.info` can be consumed by CI dashboards or locally via tools like `genhtml`.

## Deployment

Two primary paths are available via Foundry scripts:

```bash
# Deploy to Sepolia testnet (requires .env values)
make deploy-sepolia

# Deploy against a local Anvil node
make deploy-local
```

The deployment script (`script/Deploy.s.sol`) deploys the four core contracts and links dependencies:

1. `InstitutionRegistry`
2. `TemplateManager`
3. `CertificateRegistry` (wired to the institution registry)
4. `NameRegistry`

Post-deployment, addresses are printed so you can update `.env` and the frontend configuration.

## Interacting On-Chain

A comprehensive interaction script (`script/Interact.s.sol`) plus Makefile shortcuts make contract calls straightforward.

```bash
# View all supported interactions & usage hints
make interact-help

# Example flows
make interact-register-institution NAME='CodeTapasya' LOGO='ipfs://cid' CONTACT='team@org'
make interact-create-template IPFS='ipfs://template' PUBLIC=true CATEGORY='Bootcamp'
make interact-issue-certificate RECIPIENT=0xRecipient IPFS='ipfs://cert' TYPE='Winner' TEMPLATE=1
make interact-set-name NAME='Jane Doe'
make interact-verify-certificate CERT_ID=1
```

Each command loads required environment variables and uses Foundry broadcasting under the hood. For ad-hoc calls, you can also run `forge script` directly with `--sig`.

## Project Structure

```
├─ abi/                     # Generated ABIs for frontend consumption
├─ docs/                    # System overview documentation and diagrams
├─ script/                  # Deployment & interaction scripts
├─ src/                     # Solidity smart contracts
│  ├─ interfaces/           # Shared contract interfaces
├─ test/                    # Foundry unit & integration tests
├─ frontend/                # (Optional) dApp interface built atop the contracts
├─ Makefile                 # Build, deploy, interact, and utility targets
├─ foundry.toml             # Foundry configuration
├─ remappings.txt           # Import remappings for dependencies
└─ lcov.info                # Latest coverage report
```

## Support

- Raise issues or feature requests directly in the repository.
- For questions about the contract suite or integrations, reach out via the project’s discussion channels or contact the maintainers listed in the documentation.

---

Happy hacking! Mint certificates, showcase achievements, and deliver verifiable credentials with minimal friction. 👩‍🎓🛠️
