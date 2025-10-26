import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

/**
 * Generate QR code for certificate verification
 */
export async function generateCertificateQR(certId, baseUrl = window.location.origin) {
  try {
    const verifyUrl = `${baseUrl}/verify/${certId}`
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
    return { success: true, qrDataUrl, verifyUrl }
  } catch (error) {
    console.error('Error generating QR code:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate PDF from certificate HTML element
 */
export async function generateCertificatePDF(elementId, filename = 'certificate.pdf') {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Certificate element not found')
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    })

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(filename)

    return { success: true }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate PNG image from certificate element
 */
export async function generateCertificateImage(elementId, filename = 'certificate.png') {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Certificate element not found')
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    })

    return { success: true }
  } catch (error) {
    console.error('Error generating image:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Share certificate via Web Share API
 */
export async function shareCertificate(certData, url) {
  try {
    if (!navigator.share) {
      throw new Error('Web Share API not supported')
    }

    await navigator.share({
      title: `Certificate: ${certData.certName}`,
      text: `Check out my certificate: ${certData.certName}`,
      url: url,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sharing certificate:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Share on social media platforms
 */
export function shareOnSocialMedia(platform, certData, url) {
  const text = encodeURIComponent(`I earned a certificate: ${certData.certName}`)
  const shareUrl = encodeURIComponent(url)

  const urls = {
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    whatsapp: `https://wa.me/?text=${text}%20${shareUrl}`,
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${text}`,
  }

  if (urls[platform]) {
    window.open(urls[platform], '_blank', 'width=600,height=400')
    return true
  }

  return false
}

/**
 * Download certificate in multiple formats
 */
export async function downloadCertificate(elementId, format = 'pdf', certData) {
  const timestamp = Date.now()
  const baseName = `certificate_${certData.id}_${timestamp}`

  switch (format) {
    case 'pdf':
      return await generateCertificatePDF(elementId, `${baseName}.pdf`)
    case 'png':
      return await generateCertificateImage(elementId, `${baseName}.png`)
    case 'json':
      const jsonData = JSON.stringify(certData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${baseName}.json`
      link.click()
      URL.revokeObjectURL(url)
      return { success: true }
    default:
      return { success: false, error: 'Unsupported format' }
  }
}

/**
 * Certificate Verification Utilities
 * Verifies certificate authenticity by comparing blockchain and IPFS data
 */

/**
 * Verify certificate by comparing blockchain and IPFS data
 */
export async function verifyCertificate(certificateId, blockchainData) {
  try {
    const { getJSONFromIPFS } = await import('../lib/ipfs')
    
    // Check if certificate exists on blockchain
    if (!blockchainData || blockchainData.recipient === '0x0000000000000000000000000000000000000000') {
      return {
        isValid: false,
        status: 'invalid',
        message: 'Certificate not found on blockchain or has been revoked',
        details: { blockchainData }
      }
    }

    // Check if certificate is revoked
    if (blockchainData.isRevoked) {
      return {
        isValid: false,
        status: 'invalid',
        message: 'Certificate has been revoked',
        details: { blockchainData }
      }
    }

    // Check if IPFS hash exists
    if (!blockchainData.ipfsHash || blockchainData.ipfsHash === '') {
      return {
        isValid: true, // Valid on blockchain but no metadata
        status: 'no-metadata',
        message: 'Certificate is valid on blockchain but has no metadata stored on IPFS',
        details: { blockchainData }
      }
    }

    // Fetch metadata from IPFS
    let ipfsData
    try {
      ipfsData = await getJSONFromIPFS(blockchainData.ipfsHash)
    } catch (ipfsError) {
      return {
        isValid: true, // Valid on blockchain but IPFS unavailable
        status: 'error',
        message: 'Certificate is valid on blockchain but metadata could not be loaded from IPFS',
        details: { 
          blockchainData,
          error: ipfsError.message || 'Unknown error'
        }
      }
    }

    // Verify data consistency between blockchain and IPFS
    const mismatches = []

    // Check recipient address
    if (ipfsData.recipientAddress && 
        ipfsData.recipientAddress.toLowerCase() !== blockchainData.recipient.toLowerCase()) {
      mismatches.push(`Recipient address mismatch: IPFS(${ipfsData.recipientAddress}) vs Blockchain(${blockchainData.recipient})`)
    }

    // Check certificate type
    if (ipfsData.certificateType && 
        ipfsData.certificateType !== blockchainData.certificateType) {
      mismatches.push(`Certificate type mismatch: IPFS(${ipfsData.certificateType}) vs Blockchain(${blockchainData.certificateType})`)
    }

    if (mismatches.length > 0) {
      return {
        isValid: false,
        status: 'mismatch',
        message: 'Certificate data mismatch detected between blockchain and IPFS',
        details: {
          blockchainData,
          ipfsData,
          mismatches
        }
      }
    }

    // All checks passed
    return {
      isValid: true,
      status: 'verified',
      message: 'Certificate is authentic and verified',
      details: {
        blockchainData,
        ipfsData
      }
    }

  } catch (error) {
    return {
      isValid: false,
      status: 'error',
      message: 'Error during verification process',
      details: {
        error: error.message || 'Unknown error'
      }
    }
  }
}

/**
 * Get IPFS Gateway URL for a hash
 */
export function getIPFSUrl(ipfsHash) {
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'ivory-bitter-gerbil-665.mypinata.cloud'
  return `https://${gateway}/ipfs/${ipfsHash}`
}

/**
 * Generate verification URL with IPFS metadata
 */
export function generateVerificationUrl(certificateId, ipfsHash) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  let url = `${baseUrl}/verify/${certificateId}`
  
  if (ipfsHash) {
    url += `?ipfs=${ipfsHash}`
  }
  
  return url
}
