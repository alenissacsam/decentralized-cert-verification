import { ethers } from 'ethers'
import { CONTRACTS } from './config'
import {
  CERTIFICATE_REGISTRY_ABI,
  INSTITUTION_REGISTRY_ABI,
  TEMPLATE_MANAGER_ABI,
  NAME_REGISTRY_ABI
} from './abis'

/**
 * Certificate Management SDK
 * Handles all certificate-related operations
 */
export class CertificateSDK {
  constructor(provider, network = 'sepolia') {
    this.provider = provider
    this.network = network
    this.contractAddress = CONTRACTS[network].CertificateRegistry
    
    // Initialize contract instance
    this.contract = new ethers.Contract(
      this.contractAddress,
      CERTIFICATE_REGISTRY_ABI,
      provider
    )
  }

  /**
   * Issue a new certificate
   */
  async issueCertificate(certificateData) {
    try {
      const signer = await this.provider.getSigner()
      const contractWithSigner = this.contract.connect(signer)

      // Contract expects: recipient (address), ipfsHash (string), certificateType (string)
      const tx = await contractWithSigner.issueCertificate(
        certificateData.recipient,
        certificateData.ipfsHash || '', // IPFS hash for metadata
        certificateData.certType || certificateData.certificateType || 'Certificate'
      )

      const receipt = await tx.wait()
      
      // Extract certificate ID from event
      const event = receipt.logs.find(
        log => log.topics[0] === ethers.utils.id('CertificateIssued(uint256,address,address,string)')
      )
      
      if (event) {
        const certId = ethers.BigNumber.from(event.topics[1])
        return { success: true, certId: certId.toString(), txHash: receipt.hash }
      }

      return { success: true, txHash: receipt.hash }
    } catch (error) {
      console.error('Error issuing certificate:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Batch issue certificates
   * @param {string[]} recipients - Array of recipient addresses
   * @param {string[]} ipfsHashes - Array of IPFS hashes for metadata
   * @param {string} certificateType - Type of certificates being issued
   */
  async batchIssueCertificates(recipients, ipfsHashes, certificateType) {
    try {
      const signer = await this.provider.getSigner()
      const contractWithSigner = this.contract.connect(signer)

      // Contract expects: recipients (address[]), ipfsHashes (string[]), certificateType (string)
      const tx = await contractWithSigner.batchIssueCertificates(
        recipients,
        ipfsHashes,
        certificateType
      )

      const receipt = await tx.wait()
      return { success: true, txHash: receipt.hash }
    } catch (error) {
      console.error('Error batch issuing certificates:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Verify certificate authenticity
   */
  async verifyCertificate(certId) {
    try {
      const result = await this.contract.verifyCertificate(certId)
      return {
        isValid: result.isValid,
        certHash: result.certHash,
        details: result.details,
      }
    } catch (error) {
      console.error('Error verifying certificate:', error)
      return { isValid: false, error: error.message }
    }
  }

  /**
   * Get certificate details
   */
  async getCertificateDetails(certId) {
    try {
      const details = await this.contract.getCertificateDetails(certId)
      return {
        id: details.id.toString(),
        issuer: details.issuer,
        recipient: details.recipient,
        certType: details.certType,
        certName: details.certName,
        courseDetails: details.courseDetails,
        gradeInfo: details.gradeInfo,
        issueDate: Number(details.issueDate),
        expiryDate: Number(details.expiryDate),
        status: Number(details.status),
        certHash: details.certHash,
      }
    } catch (error) {
      console.error('Error getting certificate details:', error)
      return null
    }
  }

  /**
   * Get all certificates for a user
   */
  async getUserCertificates(userAddress) {
    try {
      const certIds = await this.contract.getUserCertificates(userAddress)
      const certificates = await Promise.all(
        certIds.map(id => this.getCertificateDetails(id.toString()))
      )
      return certificates.filter(cert => cert !== null)
    } catch (error) {
      console.error('Error getting user certificates:', error)
      return []
    }
  }

  /**
   * Revoke a certificate
   */
  async revokeCertificate(certId, reason) {
    try {
      const signer = await this.provider.getSigner()
      const contractWithSigner = this.contract.connect(signer)

      const tx = await contractWithSigner.revokeCertificate(certId, reason)
      const receipt = await tx.wait()

      return { success: true, txHash: receipt.hash }
    } catch (error) {
      console.error('Error revoking certificate:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Transfer certificate ownership
   */
  async transferCertificate(certId, newOwner) {
    try {
      const signer = await this.provider.getSigner()
      const contractWithSigner = this.contract.connect(signer)

      const tx = await contractWithSigner.transferCertificate(certId, newOwner)
      const receipt = await tx.wait()

      return { success: true, txHash: receipt.hash }
    } catch (error) {
      console.error('Error transferring certificate:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get total certificates issued
   */
  async getTotalCertificates() {
    try {
      const total = await this.contract.totalCertificates()
      return total.toString()
    } catch (error) {
      console.error('Error getting total certificates:', error)
      return '0'
    }
  }
}

/**
 * Organization Registry SDK
 */
export class OrganizationSDK {
  constructor(provider, network = 'sepolia') {
    this.provider = provider
    this.network = network
    this.contractAddress = CONTRACTS[network].InstitutionRegistry
    
    this.contract = new ethers.Contract(
      this.contractAddress,
      INSTITUTION_REGISTRY_ABI,
      provider
    )
  }

  async registerOrganization(orgData) {
    try {
      const signer = await this.provider.getSigner()
      const contractWithSigner = this.contract.connect(signer)

      const tx = await contractWithSigner.registerOrganization(
        orgData.name,
        orgData.orgType,
        orgData.description,
        orgData.websiteUrl
      )

      const receipt = await tx.wait()
      return { success: true, txHash: receipt.hash }
    } catch (error) {
      console.error('Error registering organization:', error)
      return { success: false, error: error.message }
    }
  }

  async getOrganizationInfo(orgAddress) {
    try {
      const info = await this.contract.getOrganizationInfo(orgAddress)
      return {
        orgAddress: info.orgAddress,
        name: info.name,
        orgType: info.orgType,
        description: info.description,
        websiteUrl: info.websiteUrl,
        verified: info.verified,
        trustScore: Number(info.trustScore),
        certificatesIssued: Number(info.certificatesIssued),
        createdAt: Number(info.createdAt),
      }
    } catch (error) {
      console.error('Error getting organization info:', error)
      return null
    }
  }

  async isVerifiedOrganization(orgAddress) {
    try {
      return await this.contract.isVerifiedOrganization(orgAddress)
    } catch (error) {
      console.error('Error checking organization verification:', error)
      return false
    }
  }
}

/**
 * User Identity SDK
 */
export class UserIdentitySDK {
  constructor(provider, network = 'sepolia') {
    this.provider = provider
    this.network = network
    this.contractAddress = CONTRACTS[network].NameRegistry
    
    this.contract = new ethers.Contract(
      this.contractAddress,
      NAME_REGISTRY_ABI,
      provider
    )
  }

  async registerUser(email, phone) {
    try {
      const signer = await this.provider.getSigner()
      const contractWithSigner = this.contract.connect(signer)

      const tx = await contractWithSigner.registerUser(email, phone)
      const receipt = await tx.wait()

      return { success: true, txHash: receipt.hash }
    } catch (error) {
      console.error('Error registering user:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserProfile(userAddress) {
    try {
      const profile = await this.contract.getUserProfile(userAddress)
      return {
        userAddress: profile.userAddress,
        email: profile.email,
        verificationLevel: Number(profile.verificationLevel),
        trustScore: Number(profile.trustScore),
        createdAt: Number(profile.createdAt),
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  async isRegisteredUser(userAddress) {
    try {
      return await this.contract.isRegisteredUser(userAddress)
    } catch (error) {
      console.error('Error checking user registration:', error)
      return false
    }
  }
}

/**
 * Badge System SDK
 */
export class BadgeSDK {
  constructor(provider, network = 'sepolia') {
    this.provider = provider
    this.network = network
    this.contractAddress = CONTRACTS[network].TemplateManager
    
    this.contract = new ethers.Contract(
      this.contractAddress,
      TEMPLATE_MANAGER_ABI,
      provider
    )
  }

  async getUserBadges(userAddress) {
    try {
      const badgeIds = await this.contract.getUserBadges(userAddress)
      const badges = await Promise.all(
        badgeIds.map(id => this.getBadgeDetails(id.toString()))
      )
      return badges.filter(badge => badge !== null)
    } catch (error) {
      console.error('Error getting user badges:', error)
      return []
    }
  }

  async getBadgeDetails(badgeId) {
    try {
      const details = await this.contract.getBadgeDetails(badgeId)
      return {
        id: details.id.toString(),
        name: details.name,
        imageURI: details.imageURI,
        criteria: details.criteria,
        issuer: details.issuer,
        createdAt: Number(details.createdAt),
      }
    } catch (error) {
      console.error('Error getting badge details:', error)
      return null
    }
  }
}
