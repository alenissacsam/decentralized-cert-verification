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
	@echo "  make verify-sepolia    - Verify contracts on Sepolia Blockscout"
	@echo "  make extract-abi       - Extract ABIs for frontend"
	@echo "  make clean             - Clean build artifacts"
	@echo "  make anvil             - Start local Anvil node"
	@echo "  make snapshot          - Generate gas snapshots"

# Install dependencies
.PHONY: install
install:
	forge install OpenZeppelin/openzeppelin-contracts 
	forge install foundry-rs/forge-std 

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
	@forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(DEPLOYER_PRIVATE_KEY) \
		--broadcast \
		--verify \
		--verifier blockscout \
		--verifier-url $(BLOCKSCOUT_API_KEY) \
		-vvvv

# Deploy to local Anvil
.PHONY: deploy-local
deploy-local:
	@forge script script/Deploy.s.sol:DeployScript \
		--rpc-url http://localhost:8545 \
		--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
		--broadcast

# Verify contracts on Sepolia Blockscout
.PHONY: verify-sepolia
verify-sepolia:
	@echo "Verifying CertificateRegistry..."
	forge verify-contract $(CERTIFICATE_REGISTRY_ADDRESS) \
		src/CertificateRegistry.sol:CertificateRegistry \
		--verifier blockscout \
		--verifier-url $(BLOCKSCOUT_API_KEY)
	@echo "Verifying InstitutionRegistry..."
	forge verify-contract $(INSTITUTION_REGISTRY_ADDRESS) \
		src/InstitutionRegistry.sol:InstitutionRegistry \
		--verifier blockscout \
		--verifier-url $(BLOCKSCOUT_API_KEY)
	@echo "Verifying TemplateManager..."
	forge verify-contract $(TEMPLATE_MANAGER_ADDRESS) \
		src/TemplateManager.sol:TemplateManager \
		--verifier blockscout \
		--verifier-url $(BLOCKSCOUT_API_KEY)

# Extract ABIs for frontend
.PHONY: extract-abi
extract-abi:
	@echo "Extracting ABIs for frontend..."
	@mkdir -p abi
	@jq '.abi' out/CertificateRegistry.sol/CertificateRegistry.json > abi/CertificateRegistry.json
	@jq '.abi' out/InstitutionRegistry.sol/InstitutionRegistry.json > abi/InstitutionRegistry.json
	@jq '.abi' out/TemplateManager.sol/TemplateManager.json > abi/TemplateManager.json
	@jq '.abi' out/NameRegistry.sol/NameRegistry.json > abi/NameRegistry.json
	@echo "ABIs extracted to abi/ directory"
	@echo "Contract addresses:"
	@echo "CertificateRegistry: $(CERTIFICATE_REGISTRY_ADDRESS)"
	@echo "InstitutionRegistry: $(INSTITUTION_REGISTRY_ADDRESS)"
	@echo "TemplateManager: $(TEMPLATE_MANAGER_ADDRESS)"
	@echo "NameRegistry: $(NAME_REGISTRY_ADDRESS)"

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

# ============================================================================
# INTERACTION TARGETS - Contract function calls via forge script
# ============================================================================
# Before running any interaction, set these environment variables:
# export CALLER_PRIVATE_KEY=0x...
# export INSTITUTION_REGISTRY_ADDRESS=0x...
# export TEMPLATE_MANAGER_ADDRESS=0x...
# export CERTIFICATE_REGISTRY_ADDRESS=0x...
# export NAME_REGISTRY_ADDRESS=0x...
# export RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY  (or http://localhost:8545 for local)

# Write Functions - Institutions
.PHONY: interact-register-institution
interact-register-institution:
	@echo "Usage: make interact-register-institution NAME='My Org' LOGO='ipfs://hash' CONTACT='contact@org.com'"
	@forge script script/Interact.s.sol:ContractInteractions --sig "registerInstitution(string,string,string)" "$(NAME)" "$(LOGO)" "$(CONTACT)" --rpc-url $(SEPOLIA_RPC_URL) --private-key $(CALLER_PRIVATE_KEY) --broadcast

.PHONY: interact-update-institution
interact-update-institution:
	@echo "Usage: make interact-update-institution LOGO='ipfs://hash' CONTACT='contact@org.com'"
	@forge script script/Interact.s.sol:ContractInteractions --sig "updateInstitutionInfo(string,string)" "$(LOGO)" "$(CONTACT)" --rpc-url $(RPC_URL) --private-key $(CALLER_PRIVATE_KEY) --broadcast

.PHONY: interact-verify-institution
interact-verify-institution:
	@echo "Usage: make interact-verify-institution INSTITUTION=0xaddr..."
	@forge script script/Interact.s.sol:ContractInteractions --sig "verifyInstitution(address)" "$(INSTITUTION)" --rpc-url $(RPC_URL) --private-key $(CALLER_PRIVATE_KEY) --broadcast

# Write Functions - Templates
.PHONY: interact-create-template
interact-create-template:
	@echo "Usage: make interact-create-template IPFS='ipfs://hash' PUBLIC=true CATEGORY='Hackathon'"
	@forge script script/Interact.s.sol:ContractInteractions --sig "createTemplate(string,bool,string)" "$(TEMP2)" "true" "College Degree certificate" --rpc-url $(SEPOLIA_RPC_URL) --private-key $(CALLER_PRIVATE_KEY) --broadcast

# Write Functions - Certificates
.PHONY: interact-issue-certificate
interact-issue-certificate:
	@echo "Usage: make interact-issue-certificate RECIPIENT=0xaddr... IPFS='ipfs://hash' TYPE='Achievement' TEMPLATE=0"
	@forge script script/Interact.s.sol:ContractInteractions --sig "issueCertificate(address,string,string,uint256)" "$(RECIPIENT)" "$(IPFS)" "$(TYPE)" "$(TEMPLATE)" --rpc-url $(RPC_URL) --private-key $(CALLER_PRIVATE_KEY) --broadcast

.PHONY: interact-revoke-certificate
interact-revoke-certificate:
	@echo "Usage: make interact-revoke-certificate CERT_ID=1"
	@forge script script/Interact.s.sol:ContractInteractions --sig "revokeCertificate(uint256)" "$(CERT_ID)" --rpc-url $(RPC_URL) --private-key $(CALLER_PRIVATE_KEY) --broadcast

# Write Functions - Names
.PHONY: interact-set-name
interact-set-name:
	@echo "Usage: make interact-set-name NAME='My Display Name'"
	@forge script script/Interact.s.sol:ContractInteractions --sig "setDisplayName(string)" "$(NAME)" --rpc-url $(RPC_URL) --private-key $(CALLER_PRIVATE_KEY) --broadcast

.PHONY: interact-clear-name
interact-clear-name:
	@forge script script/Interact.s.sol:ContractInteractions --sig "clearDisplayName()" --rpc-url $(RPC_URL) --private-key $(CALLER_PRIVATE_KEY) --broadcast

# Read Functions - Institutions
.PHONY: interact-get-institution
interact-get-institution:
	@echo "Usage: make interact-get-institution INSTITUTION=0xaddr..."
	@forge script script/Interact.s.sol:ContractInteractions --sig "getInstitution(address)" "$(INSTITUTION)" --rpc-url $(RPC_URL)

.PHONY: interact-institution-exists
interact-institution-exists:
	@echo "Usage: make interact-institution-exists INSTITUTION=0xaddr..."
	@forge script script/Interact.s.sol:ContractInteractions --sig "institutionExists(address)" "$(INSTITUTION)" --rpc-url $(RPC_URL)

# Read Functions - Certificates
.PHONY: interact-verify-certificate
interact-verify-certificate:
	@echo "Usage: make interact-verify-certificate CERT_ID=1"
	@forge script script/Interact.s.sol:ContractInteractions --sig "verifyCertificate(uint256)" "$(CERT_ID)" --rpc-url $(RPC_URL)

.PHONY: interact-get-certs-by-institution
interact-get-certs-by-institution:
	@echo "Usage: make interact-get-certs-by-institution INSTITUTION=0xaddr..."
	@forge script script/Interact.s.sol:ContractInteractions --sig "getCertificatesByInstitution(address)" "$(INSTITUTION)" --rpc-url $(RPC_URL)

.PHONY: interact-get-certs-by-recipient
interact-get-certs-by-recipient:
	@echo "Usage: make interact-get-certs-by-recipient RECIPIENT=0xaddr..."
	@forge script script/Interact.s.sol:ContractInteractions --sig "getCertificatesByRecipient(address)" "$(RECIPIENT)" --rpc-url $(RPC_URL)

.PHONY: interact-get-certificate-uri
interact-get-certificate-uri:
	@echo "Usage: make interact-get-certificate-uri CERT_ID=1"
	@forge script script/Interact.s.sol:ContractInteractions --sig "getCertificateUri(uint256)" "$(CERT_ID)" --rpc-url $(RPC_URL)

# Read Functions - Templates
.PHONY: interact-get-template
interact-get-template:
	@echo "Usage: make interact-get-template TEMPLATE_ID=1"
	@forge script script/Interact.s.sol:ContractInteractions --sig "getTemplate(uint256)" "$(TEMPLATE_ID)" --rpc-url $(RPC_URL)

.PHONY: interact-list-public-templates
interact-list-public-templates:
	@forge script script/Interact.s.sol:ContractInteractions --sig "listPublicTemplates()" --rpc-url $(RPC_URL)

.PHONY: interact-get-institution-templates
interact-get-institution-templates:
	@echo "Usage: make interact-get-institution-templates INSTITUTION=0xaddr..."
	@forge script script/Interact.s.sol:ContractInteractions --sig "getInstitutionTemplates(address)" "$(INSTITUTION)" --rpc-url $(RPC_URL)

# Read Functions - Names
.PHONY: interact-get-display-name
interact-get-display-name:
	@echo "Usage: make interact-get-display-name ACCOUNT=0xaddr..."
	@forge script script/Interact.s.sol:ContractInteractions --sig "getDisplayName(address)" "$(ACCOUNT)" --rpc-url $(RPC_URL)

# Help for interactions
.PHONY: interact-help
interact-help:
	@echo "=== Contract Interaction Commands ==="
	@echo ""
	@echo "SETUP FIRST:"
	@echo "  export CALLER_PRIVATE_KEY=0x..."
	@echo "  export INSTITUTION_REGISTRY_ADDRESS=0x..."
	@echo "  export TEMPLATE_MANAGER_ADDRESS=0x..."
	@echo "  export CERTIFICATE_REGISTRY_ADDRESS=0x..."
	@echo "  export NAME_REGISTRY_ADDRESS=0x..."
	@echo "  export RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY"
	@echo ""
	@echo "WRITE FUNCTIONS (modify state, require private key):"
	@echo "  make interact-register-institution NAME='...' LOGO='ipfs://...' CONTACT='...'"
	@echo "  make interact-update-institution LOGO='ipfs://...' CONTACT='...'"
	@echo "  make interact-verify-institution INSTITUTION=0x..."
	@echo "  make interact-create-template IPFS='ipfs://...' PUBLIC=true CATEGORY='...'"
	@echo "  make interact-issue-certificate RECIPIENT=0x... IPFS='ipfs://...' TYPE='...' TEMPLATE=0"
	@echo "  make interact-revoke-certificate CERT_ID=1"
	@echo "  make interact-set-name NAME='Your Name'"
	@echo "  make interact-clear-name"
	@echo ""
	@echo "READ FUNCTIONS (query state, no private key needed):"
	@echo "  make interact-get-institution INSTITUTION=0x..."
	@echo "  make interact-institution-exists INSTITUTION=0x..."
	@echo "  make interact-verify-certificate CERT_ID=1"
	@echo "  make interact-get-certs-by-institution INSTITUTION=0x..."
	@echo "  make interact-get-certs-by-recipient RECIPIENT=0x..."
	@echo "  make interact-get-certificate-uri CERT_ID=1"
	@echo "  make interact-get-template TEMPLATE_ID=1"
	@echo "  make interact-list-public-templates"
	@echo "  make interact-get-institution-templates INSTITUTION=0x..."
	@echo "  make interact-get-display-name ACCOUNT=0x..."
