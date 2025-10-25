## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

````shell
# Certificate Verification Platform — Smart Contracts

This repository contains the smart contracts for a blockchain-backed certificate verification platform. Certificates are issued as ERC-1155 tokens, institutions are onboarded via role-based access control, and certificate templates are managed with IPFS references.

## Contracts

- `src/InstitutionRegistry.sol` – Manages institution registration, verification, and issuance metrics.
- `src/TemplateManager.sol` – Handles certificate template creation, discovery, and usage tracking.
- `src/CertificateRegistry.sol` – Core ERC-1155 certificate issuance, verification, revocation, and template linkage.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) toolchain installed
- Node with access to Sepolia RPC endpoint (for deployment)
- jq (for ABI extraction)

## Quick Start

```bash
make install           # Install OpenZeppelin and forge-std dependencies
cp .env.example .env   # Populate RPC URLs, private keys, and API keys
make build             # Compile contracts
make test              # Execute unit and integration tests
````

## Useful Commands

| Command               | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `make test-gas`       | Run the test suite with Forge gas reporting enabled.           |
| `make coverage`       | Produce lcov and summary coverage reports.                     |
| `make deploy-local`   | Deploy contracts to a local Anvil network for manual testing.  |
| `make deploy-sepolia` | Deploy the full stack to Sepolia using configured credentials. |
| `make verify-sepolia` | Verify deployed contracts on Sepolia Etherscan.                |
| `make extract-abi`    | Export contract ABIs into `abi/` for frontend integration.     |

## Deployment Flow

1. Configure `.env` with RPC URLs, deployer keys, and Etherscan API key (see `.env.example`).
2. Ensure the deployer wallet holds sufficient Sepolia ETH (`cast balance $DEPLOYER_ADDRESS`).
3. Deploy via `make deploy-sepolia` or run the deployment script manually with Forge.
4. Verify contracts on Etherscan with `make verify-sepolia`.
5. Extract ABIs for the frontend team using `make extract-abi`.

## Testing Strategy

- **InstitutionRegistry.t.sol** – Covers registration, verification, updates, and issuance tracking.
- **TemplateManager.t.sol** – Validates template creation, listings, and usage accounting.
- **CertificateRegistry.t.sol** – Exercises issuance (single and batch), template linkage, revocation, access control, and pause flows.

The current suite targets >90% line coverage as outlined in the PRD. Extend the tests in `test/` to add fuzz cases, gas benchmarks, or additional integration scenarios as needed.

## Toolchain

- Solidity `^0.8.20`
- Foundry (forge, cast, anvil)
- OpenZeppelin Contracts v5

Consult `PRD-SmartContracts.md` for a comprehensive specification, deployment checklist, and security guidelines.
