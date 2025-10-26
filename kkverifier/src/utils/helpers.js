import QRCode from 'qrcode'
import { ethers } from 'ethers'

/**
 * Generate QR code for certificate verification
 */
export async function generateCertificateQR(certId, baseUrl = window.location.origin) {
  try {
    const verificationUrl = `${baseUrl}/verify/${certId}`
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1a73e8',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    return null
  }
}

/**
 * Generate shareable link for certificate
 */
export function generateShareableLink(certId, baseUrl = window.location.origin) {
  return `${baseUrl}/verify/${certId}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    return false
  }
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address, startChars = 6, endChars = 4) {
  if (!address) return ''
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address) {
  try {
    return ethers.utils.isAddress(address)
  } catch {
    return false
  }
}

/**
 * Format date from timestamp
 */
export function formatDate(timestamp) {
  if (!timestamp || timestamp === 0) return 'No expiry'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date with time
 */
export function formatDateTime(timestamp) {
  if (!timestamp || timestamp === 0) return 'N/A'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Check if certificate is expired
 */
export function isCertificateExpired(expiryTimestamp) {
  if (!expiryTimestamp || expiryTimestamp === 0) return false
  return Date.now() / 1000 > expiryTimestamp
}

/**
 * Get certificate status label
 */
export function getCertificateStatusLabel(status) {
  const statusMap = {
    0: { label: 'Active', color: 'green' },
    1: { label: 'Revoked', color: 'red' },
    2: { label: 'Expired', color: 'gray' },
  }
  return statusMap[status] || { label: 'Unknown', color: 'gray' }
}

/**
 * Get verification level label
 */
export function getVerificationLevelLabel(level) {
  const levelMap = {
    0: 'None',
    1: 'Basic',
    2: 'Intermediate',
    3: 'Advanced',
  }
  return levelMap[level] || 'Unknown'
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Parse error message from contract
 */
export function parseContractError(error) {
  if (error.reason) return error.reason
  if (error.message) {
    // Extract revert reason if present
    const revertMatch = error.message.match(/reverted with reason string '([^']+)'/)
    if (revertMatch) return revertMatch[1]
    
    // Extract custom error if present
    const errorMatch = error.message.match(/reverted with custom error '([^']+)'/)
    if (errorMatch) return errorMatch[1]
    
    return error.message
  }
  return 'An unknown error occurred'
}

/**
 * Format transaction hash for block explorer
 */
export function getBlockExplorerUrl(txHash, network = 'polygon-mumbai') {
  const explorers = {
    'polygon-mumbai': 'https://mumbai.polygonscan.com/tx/',
    'polygon-mainnet': 'https://polygonscan.com/tx/',
    localhost: '#',
  }
  return `${explorers[network] || explorers['polygon-mumbai']}${txHash}`
}

/**
 * Download text as file
 */
export function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Download image from data URL
 */
export function downloadImage(dataUrl, filename) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone) {
  const phoneRegex = /^\+?[\d\s-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

/**
 * Generate random ID
 */
export function generateRandomId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
