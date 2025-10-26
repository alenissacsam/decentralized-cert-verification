'use client'

import { useState, useEffect } from 'react'
import { useContracts } from '@/contexts/ContractContext'
import { useWeb3 } from '@/contexts/Web3Context'
import { FiAward, FiDownload, FiShare2, FiCalendar, FiUser, FiExternalLink } from 'react-icons/fi'
import { generateCertificatePDF, shareCertificate, generateCertificateQR } from '@/utils/certificate'
import Alert from '@/components/Alert'
import LoadingSpinner from '@/components/LoadingSpinner'
import Link from 'next/link'

export default function UserDashboard() {
  const { getUserCertificates, getCertificateDetails } = useContracts()
  const { account, isConnected, connectWallet } = useWeb3()
  
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [selectedCert, setSelectedCert] = useState(null)

  useEffect(() => {
    if (isConnected && account) {
      loadCertificates()
    }
  }, [isConnected, account])

  const loadCertificates = async () => {
    setLoading(true)
    try {
      const result = await getUserCertificates(account)
      if (result.success && result.certificateIds) {
        // Load details for each certificate
        const certDetails = await Promise.all(
          result.certificateIds.map(async (id) => {
            const details = await getCertificateDetails(id)
            return details.success ? { id, ...details } : null
          })
        )
        setCertificates(certDetails.filter(c => c !== null))
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load certificates' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (cert) => {
    try {
      const certElement = document.getElementById(`cert-${cert.id}`)
      if (certElement) {
        await generateCertificatePDF(`cert-${cert.id}`, `certificate-${cert.id}.pdf`)
        setAlert({ type: 'success', message: 'Certificate downloaded successfully!' })
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to download certificate' })
    }
  }

  const handleShare = async (cert) => {
    try {
      const baseUrl = window.location.origin
      await shareCertificate(cert.id, baseUrl)
      setAlert({ type: 'success', message: 'Share link copied to clipboard!' })
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to share certificate' })
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <FiUser className="text-6xl text-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">User Dashboard</h2>
          <p className="text-gray-600 mb-6">Connect MetaMask to view your certificates and blockchain credentials</p>
          <button
            onClick={connectWallet}
            className="w-full px-6 py-3 bg-gradient-to-r from-saffron to-green text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🦊</span>
            Connect MetaMask
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Don't have MetaMask?{' '}
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green hover:underline"
            >
              Install it here
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10">
      <div className="h-1 bg-tricolor-gradient"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
            <button
              onClick={loadCertificates}
              className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition-all text-sm font-semibold text-gray-700"
            >
              Refresh
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FiUser className="text-saffron" />
            <span className="text-sm">
              <span className="font-semibold">Wallet:</span> {account?.slice(0, 10)}...{account?.slice(-8)}
            </span>
          </div>
        </div>

        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-saffron">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Certificates</p>
                <p className="text-3xl font-bold text-gray-900">{certificates.length}</p>
              </div>
              <FiAward className="text-4xl text-saffron" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Verified On</p>
                <p className="text-lg font-bold text-gray-900">Blockchain</p>
              </div>
              <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-navy">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Security</p>
                <p className="text-lg font-bold text-gray-900">100% Tamper-Proof</p>
              </div>
              <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-lg text-center">
            <FiAward className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600">
              Certificates issued to your wallet address will appear here
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                {/* Certificate Preview */}
                <div 
                  id={`cert-${cert.id}`}
                  className="h-48 bg-gradient-to-br from-saffron/20 via-white to-green/20 p-6 flex flex-col justify-between border-b-4"
                  style={{
                    borderImage: 'linear-gradient(to right, #FF9933, #FFFFFF, #138808) 1'
                  }}
                >
                  <div>
                    <div className="inline-block px-3 py-1 bg-white/80 rounded-full text-xs font-semibold text-gray-700 mb-3">
                      Certificate #{cert.id}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {cert.courseName || 'Certificate'}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCalendar className="text-saffron" />
                    <span>
                      {cert.issueDate 
                        ? new Date(cert.issueDate * 1000).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Issued By</p>
                    <p className="text-xs font-mono text-gray-800 break-all">
                      {cert.issuer?.slice(0, 20)}...
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => handleDownload(cert)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-saffron text-white rounded-lg hover:bg-saffronDark transition-all text-sm font-semibold"
                    >
                      <FiDownload />
                      Download
                    </button>
                    
                    <button
                      onClick={() => handleShare(cert)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green text-white rounded-lg hover:bg-greenDark transition-all text-sm font-semibold"
                    >
                      <FiShare2 />
                      Share
                    </button>
                  </div>

                  <Link
                    href={`/verify/${cert.id}`}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-all text-sm font-semibold"
                  >
                    <FiExternalLink />
                    View Full Certificate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        {certificates.length > 0 && (
          <div className="mt-12 bg-white p-6 rounded-xl shadow-lg border-l-4 border-saffron">
            <h3 className="font-bold text-lg mb-3 text-gray-900">📱 QR Code Verification</h3>
            <p className="text-gray-600 mb-2">
              Each certificate has a unique QR code that anyone can scan to verify its authenticity. 
              The QR code links directly to this dashboard showing the verified certificate details.
            </p>
            <p className="text-sm text-gray-500">
              Share your certificate link or download the PDF with the embedded QR code for easy verification.
            </p>
          </div>
        )}
      </div>

      <div className="h-1 bg-tricolor-gradient mt-12"></div>
    </div>
  )
}
