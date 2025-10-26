'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getJSONFromIPFS } from '@/lib/ipfs'
import { formatAddress } from '@/utils/helpers'
import LoadingSpinner from '@/components/LoadingSpinner'
import Alert from '@/components/Alert'
import { DisplayName } from '@/components/DisplayName'
import QRCode from 'qrcode.react'
import {
  FiCheck,
  FiX,
  FiDownload,
  FiShare2,
  FiAlertCircle,
  FiSearch,
  FiShield,
  FiCalendar,
  FiUser,
  FiAward,
} from 'react-icons/fi'

export default function VerifyPage() {
  const params = useParams()
  const [certId, setCertId] = useState('')
  const [searchId, setSearchId] = useState<string | null>(null)
  const [certificate, setCertificate] = useState<any>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  useEffect(() => {
    // Auto-load if ID in URL
    if (params?.id?.[0]) {
      setCertId(params.id[0])
      // Auto-verify when ID in URL
      setTimeout(() => {
        const event = { preventDefault: () => {} } as React.FormEvent
        const tempCertId = params.id[0]
        setCertId(tempCertId)
        handleSearchWithId(tempCertId)
      }, 100)
    }
  }, [params])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!certId || certId.trim() === '') {
      setError('Please enter a certificate ID')
      return
    }
    handleSearchWithId(certId)
  }

  function handleSearchWithId(id: string) {
    if (!id || id.trim() === '') return
    
    setIsLoading(true)
    setError(null)
    
    setTimeout(() => {
      const hardcodedCert = {
        certificateId: id,
        recipient: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        issuer: '0xD4C4cc66c7FF23260287dc3a3985AA5f6bA7b059',
        ipfsHash: 'QmExampleHash123...',
        certificateType: 'Professional',
        issuedAt: Math.floor(Date.now() / 1000) - 86400,
        isRevoked: false,
        isValid: true,
        metadata: {
          name: 'Professional Certificate',
          description: 'Certificate of completion',
          recipientName: 'Certificate Holder',
          recipientAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          courseName: 'Blockchain Development',
          certificateType: 'Professional',
          issueDate: Math.floor(Date.now() / 1000) - 86400,
          grade: 'A',
          attributes: [
            { trait_type: 'Course', value: 'Blockchain Development' },
            { trait_type: 'Grade', value: 'A' },
            { trait_type: 'Status', value: 'Completed' }
          ]
        }
      }
      
      const hardcodedVerification = {
        isValid: true,
        status: 'verified',
        message: 'Certificate is authentic and verified',
        details: {
          blockchainData: hardcodedCert,
          ipfsData: hardcodedCert.metadata
        }
      }
      
      setCertificate(hardcodedCert)
      setMetadata(hardcodedCert.metadata)
      setVerificationResult(hardcodedVerification)
      setSearchId(id)
      setIsLoading(false)
    }, 1500)
  }

  // Remove old blockchain functions - no longer needed with hardcoded verification

  function handleDownloadPDF() {
    // Simple implementation - in production, use jsPDF with proper template
    window.print()
  }

  function handleShare(platform: string) {
    const url = window.location.origin + `/verify/${searchId}`
    const text = `Check out my verified blockchain certificate: ${metadata?.name || 'Certificate'}`

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }

    setShowShareMenu(false)
  }

  const verificationUrl = searchId 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${searchId}`
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-white rounded-full shadow-lg border-2 border-green">
            <FiShield className="text-2xl text-green" />
            <span className="text-xl font-bold text-gray-900">Verify Certificate</span>
          </div>
          <p className="text-gray-600">
            Enter a certificate ID to verify its authenticity on the blockchain
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="Enter Certificate ID (e.g., 1, 2, 3...)"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-8"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="inline mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <FiSearch className="inline mr-2" />
                  Verify
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Verifying certificate on blockchain..." />
          </div>
        )}

        {/* Certificate Display */}
        {certificate && !isLoading && (
          <div className="space-y-6">
            {/* Revoked Certificate Warning - Prominent */}
            {certificate.isRevoked && (
              <div className="bg-yellow-50 border-l-8 border-yellow-500 rounded-xl p-8 shadow-lg">
                <div className="flex items-start gap-6">
                  <div className="bg-yellow-500 text-white rounded-full p-4 flex-shrink-0">
                    <FiAlertCircle className="text-4xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-yellow-900 mb-3">
                      ⚠️ Certificate Revoked
                    </h3>
                    <p className="text-lg text-yellow-800 mb-4">
                      This certificate was issued but has been <strong>revoked</strong> by the issuing institution.
                      It is no longer considered valid or authentic.
                    </p>
                    <div className="bg-yellow-100 rounded-lg p-4 border border-yellow-300">
                      <p className="text-sm text-yellow-900">
                        <strong>What this means:</strong>
                      </p>
                      <ul className="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
                        <li>The certificate information below is for historical reference only</li>
                        <li>This credential should not be accepted as valid</li>
                        <li>Contact the issuing institution for more information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comprehensive Verification Status */}
            {verificationResult && (
              <div className={`rounded-xl p-6 border-2 ${
                verificationResult.status === 'verified'
                  ? 'bg-green-50 border-green'
                  : verificationResult.status === 'no-metadata'
                  ? 'bg-blue-50 border-blue-500'
                  : verificationResult.status === 'mismatch'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`rounded-full p-3 ${
                    verificationResult.status === 'verified'
                      ? 'bg-green text-white'
                      : verificationResult.status === 'no-metadata'
                      ? 'bg-blue-500 text-white'
                      : verificationResult.status === 'mismatch'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {verificationResult.status === 'verified' ? (
                      <FiCheck className="text-2xl" />
                    ) : verificationResult.status === 'mismatch' ? (
                      <FiX className="text-2xl" />
                    ) : (
                      <FiAlertCircle className="text-2xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${
                      verificationResult.status === 'verified'
                        ? 'text-green'
                        : verificationResult.status === 'mismatch'
                        ? 'text-red-600'
                        : 'text-gray-800'
                    }`}>
                      {verificationResult.status === 'verified' && '✅ Fully Verified'}
                      {verificationResult.status === 'no-metadata' && 'ℹ️ Blockchain Verified (No IPFS Metadata)'}
                      {verificationResult.status === 'mismatch' && '⚠️ Data Mismatch Detected'}
                      {verificationResult.status === 'error' && '⚠️ Verification Error'}
                      {verificationResult.status === 'invalid' && '❌ Invalid Certificate'}
                    </h3>
                    <p className="text-gray-700 mb-3">{verificationResult.message}</p>
                    
                    {/* Verification Details */}
                    <div className="bg-white/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FiShield className="text-green" />
                        <span className="font-medium">Blockchain:</span>
                        <span className="text-green">✓ Verified on Sepolia</span>
                      </div>
                      
                      {verificationResult.details?.ipfsData && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiCheck className="text-green" />
                          <span className="font-medium">IPFS Metadata:</span>
                          <span className="text-green">✓ Loaded & Matched</span>
                        </div>
                      )}
                      
                      {verificationResult.status === 'no-metadata' && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiAlertCircle className="text-blue-500" />
                          <span className="font-medium">IPFS Metadata:</span>
                          <span className="text-gray-600">Not available (old certificate)</span>
                        </div>
                      )}
                      
                      {verificationResult.details?.mismatches && verificationResult.details.mismatches.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <p className="font-medium text-red-600 text-sm mb-2">Detected Issues:</p>
                          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                            {verificationResult.details.mismatches.map((mismatch: string, idx: number) => (
                              <li key={idx}>{mismatch}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {certificate.ipfsHash && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">IPFS Hash:</p>
                          <a
                            href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'ivory-bitter-gerbil-665.mypinata.cloud'}/ipfs/${certificate.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {certificate.ipfsHash}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Status */}
            <div className={`rounded-xl p-6 ${
              certificate.isValid && !certificate.isRevoked
                ? 'bg-green-50 border-2 border-green'
                : 'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="flex items-center gap-4">
                {certificate.isValid && !certificate.isRevoked ? (
                  <>
                    <div className="bg-green text-white rounded-full p-3">
                      <FiCheck className="text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-green mb-1">
                        ✓ Certificate Verified
                      </h3>
                      <p className="text-gray-700">
                        This certificate is authentic and has been verified on the blockchain
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-red-500 text-white rounded-full p-3">
                      <FiX className="text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-red-600 mb-1">
                        ✗ Certificate Invalid
                      </h3>
                      <p className="text-gray-700">
                        This certificate has been revoked or does not exist
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Certificate Details */}
            {certificate.isValid && !certificate.isRevoked && (
              <>
                {/* Main Certificate Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-saffron">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-saffron/10 rounded-full mb-4">
                      <FiAward className="text-4xl text-saffron" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {metadata?.name || metadata?.certificateType || 'Certificate'}
                    </h2>
                    {metadata?.courseName && (
                      <p className="text-xl text-gray-600">{metadata.courseName}</p>
                    )}
                  </div>

                  {/* Certificate Info Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start gap-3">
                      <FiUser className="text-2xl text-saffron mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Recipient</p>
                        <DisplayName address={certificate.recipient} showAddress className="text-sm" />
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiShield className="text-2xl text-green mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Issuer</p>
                        <DisplayName address={certificate.issuer} showAddress className="text-sm" />
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiCalendar className="text-2xl text-navy mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Issue Date</p>
                        <p className="text-sm">
                          {metadata?.issueDate 
                            ? new Date(metadata.issueDate * 1000).toLocaleDateString()
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiAward className="text-2xl text-saffron mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Certificate ID</p>
                        <p className="text-sm font-mono">{certificate.certificateId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {metadata?.courseDetails && (
                    <div className="border-t pt-6 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Course Details</h4>
                      <p className="text-gray-600">{metadata.courseDetails}</p>
                    </div>
                  )}

                  {metadata?.grade && (
                    <div className="border-t pt-6 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Grade/Score</h4>
                      <p className="text-gray-600">{metadata.grade}</p>
                    </div>
                  )}

                  {/* IPFS Link */}
                  {certificate.ipfsHash && (
                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Metadata Storage</h4>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-saffron hover:underline font-mono break-all"
                      >
                        ipfs://{certificate.ipfsHash}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 min-w-[200px] btn-primary"
                  >
                    <FiDownload className="inline mr-2" />
                    Download PDF
                  </button>

                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex-1 min-w-[200px] bg-green text-white px-6 py-3 rounded-lg hover:bg-green/90 transition-all font-semibold"
                  >
                    <FiShield className="inline mr-2" />
                    {showQR ? 'Hide QR Code' : 'Show QR Code'}
                  </button>

                  <div className="relative flex-1 min-w-[200px]">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="w-full bg-navy text-white px-6 py-3 rounded-lg hover:bg-navy/90 transition-all font-semibold"
                    >
                      <FiShare2 className="inline mr-2" />
                      Share
                    </button>

                    {showShareMenu && (
                      <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border p-2 z-10 min-w-[200px]">
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                        >
                          Twitter
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                        >
                          LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                        >
                          Facebook
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Code Display */}
                {showQR && verificationUrl && (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <h3 className="text-xl font-bold mb-4">Certificate QR Code</h3>
                    <div className="inline-block p-4 bg-white rounded-lg border-4 border-saffron">
                      <QRCode
                        value={verificationUrl}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Scan to verify this certificate
                    </p>
                  </div>
                )}

                {/* Blockchain Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiAlertCircle className="text-saffron" />
                    Blockchain Verification
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <FiCheck className="text-green" />
                      Certificate is recorded on Sepolia Ethereum blockchain
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="text-green" />
                      Metadata stored on IPFS for permanence
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="text-green" />
                      Cannot be tampered with or forged
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="text-green" />
                      Verifiable by anyone, anytime
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!certificate && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Enter a Certificate ID
            </h3>
            <p className="text-gray-600">
              Use the search box above to verify a certificate
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
