// Contract addresses for different networks
export const CONTRACTS = {
  sepolia: {
    CertificateRegistry: process.env.NEXT_PUBLIC_CERTIFICATE_REGISTRY_ADDRESS || '0xe38C32FC0290ceb5189d4dF130c37d0C82ce876f',
    InstitutionRegistry: process.env.NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS || '0xD4C4cc66c7FF23260287dc3a3985AA5f6bA7b059',
    TemplateManager: process.env.NEXT_PUBLIC_TEMPLATE_MANAGER_ADDRESS || '0x5D61562121d28b772e4f782DC12f61FfCbd861ad',
    NameRegistry: process.env.NEXT_PUBLIC_NAME_REGISTRY_ADDRESS || '0xAD96F1220a5Ead242ED3ec774a9FB59e157d8520',
  },
  localhost: {
    CertificateRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    InstitutionRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    TemplateManager: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
}

// Network configurations
export const NETWORKS = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
  localhost: {
    chainId: '0x7a69', // 31337
    chainName: 'Localhost',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://127.0.0.1:8545/'],
    blockExplorerUrls: [],
  },
}

// Certificate status
export const CERT_STATUS = {
  ACTIVE: 0,
  REVOKED: 1,
  EXPIRED: 2,
}

// Verification levels
export const VERIFICATION_LEVELS = {
  NONE: 0,
  BASIC: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
}

// App configuration
export const APP_CONFIG = {
  appName: 'KK Verifier',
  appDescription: 'Blockchain Certificate Verification Platform',
  defaultNetwork: 'polygon-mumbai',
  supportEmail: 'support@kkverifier.com',
}

// Hardcoded authorized organizer addresses (for prototype)
// In production, this should be managed by smart contract
export const AUTHORIZED_ORGANIZERS = [
  '0x0000000000000000000000000000000000000000', // Replace with actual organizer wallet addresses
  // Add more organizer addresses here
]
