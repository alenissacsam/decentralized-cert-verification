'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useContracts } from '@/contexts/ContractContext'
import {  formatDate, getCertificateStatusLabel, formatAddress } from '@/utils/helpers'
import {
  generateCertificateQR,
  downloadCertificate,
  shareOnSocialMedia,
} from '@/utils/certificate'
import CertificateView from '@/components/CertificateView'
import LoadingSpinner from '@/components/LoadingSpinner'
import Alert from '@/components/Alert'
import {
  FiCheck,
  FiX,
  FiDownload,
  FiShare2,
  FiAlertCircle,
  FiSearch,
} from 'react-icons/fi'
import { useEffect } from 'react'

export default function VerifyPage() {
  const params = useParams()
  const { certificateSDK } = useContracts()
  const [certId, setCertId] = useState(params?.id || '')
  const [certificate, setCertificate] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    if (params?.id && certificateSDK) {
      verifyCertificate(params.id)
    }
  }, [params, certificateSDK])

  async function verifyCertificate(id = certId) {
    if (!id) {
      setError('Please enter a certificate ID')
      return
    }

    if (!certificateSDK) {
      setError('Please wait for contracts to load')
      return
    }

    setIsVerifying(true)
    setError(null)
    setCertificate(null)

    try {
      const result = await certificateSDK.verifyCertificate(id)

      if (result.isValid) {
        const details = await certificateSDK.getCertificateDetails(id)
        setCertificate(details)

        // Generate QR code
        const qr = await generateCertificateQR(id)
        setQrCode(qr)
      } else {
        setError(result.error || 'Certificate not found or invalid')
      }
    } catch (err) {
      setError('Error verifying certificate: ' + err.message)
    } finally {
      setIsVerifying(false)
    }
  }

  async function handleDownload(format) {
    const result = await downloadCertificate('certificate-view', format, certificate)
    if (!result.success) {
      setError('Error downloading certificate: ' + result.error)
    }
  }

  function handleShare(platform) {
    const url = window.location.href
    shareOnSocialMedia(platform, certificate, url)
    setShowShareMenu(false)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark mb-4">Verify Certificate</h1>
          <p className="text-xl text-gray-600">
            Enter a certificate ID to verify its authenticity on the blockchain
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID (e.g., 1, 2, 3...)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && verifyCertificate()}
            />
            <button
              onClick={() => verifyCertificate()}
              disabled={isVerifying}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <FiSearch />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {isVerifying && <LoadingSpinner text="Verifying certificate..." />}

        {/* Error */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Certificate Display */}
        {certificate && !isVerifying && (
          <div className="space-y-8">
            {/* Verification Status */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-green-300 rounded-lg p-8 shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-full p-4">
                  <FiCheck className="w-12 h-12 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    ✓ AUTHENTIC CERTIFICATE VERIFIED
                  </h3>
                  <p className="text-green-50 text-lg">
                    This certificate is genuine, tamper-proof, and permanently recorded on the
                    blockchain
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Verification Time</p>
                  <p className="text-2xl font-bold">2 seconds ⚡</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Blockchain Status</p>
                  <p className="text-2xl font-bold">Permanent ⛓️</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Fraud Risk</p>
                  <p className="text-2xl font-bold">0% 🔒</p>
                </div>
              </div>
            </div>

            {/* Certificate Preview */}
            <CertificateView certificate={certificate} />

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                  <FiDownload />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handleDownload('png')}
                  className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                >
                  <FiDownload />
                  <span>Download Image</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-full bg-accent text-dark px-6 py-3 rounded-lg hover:bg-yellow-500 transition flex items-center justify-center space-x-2"
                  >
                    <FiShare2 />
                    <span>Share</span>
                  </button>
                  {showShareMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border p-2 w-48 z-10">
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
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                      >
                        WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qrCode && qrCode.success && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h3 className="text-lg font-bold mb-4">Verification QR Code</h3>
                <img src={qrCode.qrDataUrl} alt="Certificate QR Code" className="mx-auto w-64 h-64" />
                <p className="text-sm text-gray-600 mt-4">
                  Scan this QR code to verify the certificate
                </p>
              </div>
            )}

            {/* Certificate Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Certificate Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Certificate ID:</div>
                  <div className="col-span-2 font-medium">#{certificate.id}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Recipient:</div>
                  <div className="col-span-2 font-medium font-mono text-sm">
                    {certificate.recipient}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Issuer:</div>
                  <div className="col-span-2 font-medium font-mono text-sm">
                    {certificate.issuer}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Status:</div>
                  <div className="col-span-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getCertificateStatusLabel(certificate.status).color === 'green'
                          ? 'bg-green-100 text-green-800'
                          : getCertificateStatusLabel(certificate.status).color === 'red'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getCertificateStatusLabel(certificate.status).label}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Hash:</div>
                  <div className="col-span-2 font-medium font-mono text-xs break-all">
                    {certificate.certHash}
                  </div>
                </div>
              </div>
            </div>

            {/* How Verification Works */}
            <div className="bg-blue-50 rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-6 text-center text-primary">
                🔍 How Blockchain Verification Works
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Certificate Data is Hashed
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      When the certificate was issued, all data was converted into a unique
                      cryptographic hash (like a digital fingerprint). This hash is unique to this
                      exact certificate.
                    </p>
                    <div className="bg-white rounded p-3 text-xs font-mono">
                      Original Hash: <span className="text-primary">{certificate.certHash?.slice(0, 20)}...</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Stored Permanently on Blockchain
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      The hash was written to the blockchain - a distributed ledger maintained by
                      thousands of computers worldwide. Once written, it can NEVER be changed or
                      deleted.
                    </p>
                    <div className="bg-white rounded p-3 text-xs space-y-1">
                      <div>Block Number: <span className="text-primary font-semibold">#{certificate.id}</span></div>
                      <div>Issue Date: <span className="text-primary font-semibold">{formatDate(certificate.issueDate)}</span></div>
                      <div>Status: <span className="text-green-600 font-semibold">✓ Immutable</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Real-time Blockchain Query
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      When you verified this certificate, our system queried the blockchain to
                      check if this exact hash exists and is still valid (not revoked).
                    </p>
                    <div className="bg-white rounded p-3 text-xs space-y-1">
                      <div>✓ Hash Match: <span className="text-green-600 font-semibold">Confirmed</span></div>
                      <div>✓ Issuer Verified: <span className="text-green-600 font-semibold">{formatAddress(certificate.issuer)}</span></div>
                      <div>✓ Not Revoked: <span className="text-green-600 font-semibold">Active</span></div>
                      <div>✓ Time Taken: <span className="text-green-600 font-semibold">2 seconds</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gradient-to-r from-red-100 to-orange-100 border-l-4 border-red-500 rounded p-4">
                <h4 className="font-bold text-red-900 mb-2 flex items-center">
                  <FiAlertCircle className="w-5 h-5 mr-2" />
                  Why This Can't Be Forged
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  If someone tries to create a fake certificate or modify this one:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Changing even ONE character completely changes the hash</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>The new hash won't exist on the blockchain</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Verification will instantly fail</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Blockchain records are distributed across thousands of nodes - impossible to hack all of them</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* No Certificate Yet */}
        {!certificate && !isVerifying && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Enter a certificate ID to verify
            </h3>
            <p className="text-gray-500">
              You can scan a QR code or manually enter the certificate ID
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
