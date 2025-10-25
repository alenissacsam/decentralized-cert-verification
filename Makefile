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
	@echo "  make coverage          - Run tests with coverage report"
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
.PHONY: coverage
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
