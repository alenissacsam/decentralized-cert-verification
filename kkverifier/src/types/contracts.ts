/**
 * TypeScript interfaces matching smart contract structs
 * Based on: https://github.com/alenissacsam/decentralized-cert-verification
 */

// ============================================
// CERTIFICATE REGISTRY TYPES
// ============================================

/**
 * Certificate struct - matches Solidity contract exactly
 * From CertificateRegistry.sol
 */
export interface Certificate {
  ipfsHash: string;
  issuer: string;
  recipient: string;
  issuedAt: bigint;
  certificateType: string;
  revoked: boolean;
}

/**
 * Certificate metadata stored on IPFS
 * This is the JSON data referenced by ipfsHash
 */
export interface CertificateMetadata {
  name: string;
  description?: string;
  courseName?: string;
  courseDetails?: string;
  grade?: string;
  issueDate?: number;
  expiryDate?: number;
  recipientName?: string;
  recipientEmail?: string;
  image?: string; // Base64 or IPFS link to certificate image
  attributes?: Record<string, any>;
  [key: string]: any;
}

// ============================================
// INSTITUTION REGISTRY TYPES
// ============================================

/**
 * Institution struct - matches Solidity contract exactly
 * From InstitutionRegistry.sol
 */
export interface Institution {
  name: string;
  logoIpfsHash: string;
  contactInfo: string;
  totalCertificatesIssued: bigint;
  registeredAt: bigint;
  verified: boolean; // Auto-set to true on registration
}

/**
 * Institution contact information (stored as JSON on IPFS or as string)
 */
export interface InstitutionContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  country?: string;
  [key: string]: any;
}

// ============================================
// TEMPLATE MANAGER TYPES
// ============================================

/**
 * Template struct - matches Solidity contract exactly
 * From TemplateManager.sol
 */
export interface Template {
  ipfsHash: string;
  creator: string;
  isPublic: boolean;
  category: string;
  usageCount: bigint;
  createdAt: bigint;
}

/**
 * Template design metadata stored on IPFS
 */
export interface TemplateMetadata {
  name: string;
  description?: string;
  category: string;
  preview?: string; // Base64 or IPFS link to preview image
  design: {
    layout?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      text?: string;
      background?: string;
    };
    fonts?: {
      title?: string;
      body?: string;
    };
    elements?: Array<{
      type: 'text' | 'image' | 'qr' | 'signature';
      content?: string;
      position?: { x: number; y: number };
      style?: Record<string, any>;
    }>;
  };
  [key: string]: any;
}

// ============================================
// HELPER TYPES
// ============================================

/**
 * Combined certificate data with metadata
 */
export interface CertificateWithMetadata extends Certificate {
  metadata?: CertificateMetadata;
  template?: Template;
}

/**
 * Combined institution data
 */
export interface InstitutionWithDetails extends Institution {
  address: string;
  logo?: string; // Fetched from IPFS
  contactDetails?: InstitutionContactInfo;
}

/**
 * Combined template data with metadata
 */
export interface TemplateWithMetadata extends Template {
  metadata?: TemplateMetadata;
}

// ============================================
// BATCH ISSUANCE TYPES
// ============================================

/**
 * Batch certificate data for CSV upload
 */
export interface BatchCertificateData {
  recipient: string; // Ethereum address
  recipientName?: string;
  courseName?: string;
  grade?: string;
  templateId?: number; // Optional: different template per recipient
  metadata: CertificateMetadata;
}

/**
 * CSV row format for batch issuance
 */
export interface CertificateCsvRow {
  address: string;
  name: string;
  email?: string;
  courseName?: string;
  grade?: string;
  templateId?: string;
  [key: string]: string | undefined;
}

// ============================================
// UI STATE TYPES
// ============================================

/**
 * Certificate issuance form data
 */
export interface IssueCertificateForm {
  recipient: string;
  certificateType: string;
  templateId?: number;
  metadata: CertificateMetadata;
}

/**
 * Institution registration form data
 */
export interface RegisterInstitutionForm {
  name: string;
  logoFile?: File;
  logoIpfsHash?: string;
  contactInfo: string | InstitutionContactInfo;
}

/**
 * Template creation form data
 */
export interface CreateTemplateForm {
  name: string;
  description?: string;
  category: string;
  isPublic: boolean;
  design: TemplateMetadata['design'];
}

// ============================================
// TRANSACTION TYPES
// ============================================

/**
 * Transaction status for UI feedback
 */
export type TransactionStatus = 'idle' | 'preparing' | 'pending' | 'success' | 'error';

/**
 * Transaction result
 */
export interface TransactionResult {
  status: TransactionStatus;
  hash?: string;
  error?: Error;
  data?: any;
}
