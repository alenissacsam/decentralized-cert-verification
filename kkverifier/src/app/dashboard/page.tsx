'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useGetCertificatesByRecipient, useCertificate, useGetName, useSetName } from '@/hooks/useContracts'
import { getJSONFromIPFS } from '@/lib/ipfs'
// import { supabase } from '@/lib/supabase' // Removed - using blockchain only
import { formatAddress } from '@/utils/helpers'
import LoadingSpinner from '@/components/LoadingSpinner'
import Alert from '@/components/Alert'
import { DisplayName } from '@/components/DisplayName'
import QRCode from 'qrcode.react'
import { FiAward, FiCheckCircle, FiShield, FiDownload, FiShare2, FiEye, FiX } from 'react-icons/fi'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function DashboardPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCert, setSelectedCert] = useState<any>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState('')
  const [showNameForm, setShowNameForm] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    secure: 0,
  })

  // Fetch certificate IDs for the connected wallet
  const { certificateIds, isLoading: isLoadingIds } = useGetCertificatesByRecipient(address)
  
  // Display name hooks
  const { displayName, refetch: refetchName } = useGetName(address)
  const { write: setName, isLoading: isSettingName, isSuccess: nameSet } = useSetName()

  useEffect(() => {
    if (nameSet) {
      refetchName()
      setShowNameForm(false)
      setNewDisplayName('')
    }
  }, [nameSet, refetchName])

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }
  }, [isConnected, router])

  useEffect(() => {
    if (certificateIds && certificateIds.length > 0) {
      loadCertificatesDetails(certificateIds)
    } else if (!isLoadingIds) {
      setIsLoading(false)
      // All data is on blockchain - no fallback needed
    }
  }, [certificateIds, isLoadingIds])

  async function loadCertificatesDetails(ids: bigint[]) {
    setIsLoading(true)
    setError(null)

    try {
      const certsPromises = ids.map(async (id) => {
        try {
          // Fetch certificate data directly from blockchain using ethers
          const { ethers } = await import('ethers')
          const provider = new ethers.providers.Web3Provider((window as any).ethereum)
          const { CERTIFICATE_REGISTRY_ABI } = await import('@/contracts/abis')
          const { CONTRACTS } = await import('@/contracts/config')
          
          const contract = new ethers.Contract(
            CONTRACTS.sepolia.CertificateRegistry,
            CERTIFICATE_REGISTRY_ABI,
            provider
          )
          
          // Call the contract's certificates mapping
          const certData = await contract.certificates(id)
          
          if (!certData || !certData.recipient) return null

          // Load metadata from IPFS
          let metadata = null
          if (certData.ipfsHash) {
            try {
              metadata = await getJSONFromIPFS(certData.ipfsHash)
            } catch (ipfsError) {
              console.error(`Error loading IPFS for cert ${id}:`, ipfsError)
            }
          }

          // Extract just the hash if a full URL was stored
          let cleanIpfsHash = certData.ipfsHash
          if (cleanIpfsHash && cleanIpfsHash.includes('/ipfs/')) {
            cleanIpfsHash = cleanIpfsHash.split('/ipfs/').pop()
          }
          if (cleanIpfsHash && cleanIpfsHash.startsWith('https://')) {
            cleanIpfsHash = cleanIpfsHash.split('/').pop()
          }

          return {
            id: id.toString(),
            recipient: certData.recipient,
            issuer: certData.issuer,
            ipfsHash: cleanIpfsHash,
            certificateType: certData.certificateType,
            issuedAt: certData.issuedAt ? Number(certData.issuedAt) : 0,
            isRevoked: certData.isRevoked || false,
            templateId: certData.templateId ? Number(certData.templateId) : 0,
            metadata,
          }
        } catch (err) {
          console.error(`Error loading certificate ${id}:`, err)
          return null
        }
      })

      const loadedCerts = await Promise.all(certsPromises)
      const validCerts = loadedCerts.filter((cert) => cert !== null)

      setCertificates(validCerts)
      updateStats(validCerts)
    } catch (err: any) {
      console.error('Error loading certificates:', err)
      setError('Failed to load certificates. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Removed Supabase fallback function - using blockchain only

  function updateStats(certs: any[]) {
    setStats({
      total: certs.length,
      verified: certs.filter((c) => !c.isRevoked).length,
      secure: certs.length, // All blockchain certs are secure
    })
  }

  async function handleDownloadPDF(cert: any) {
    try {
      const certElement = document.getElementById(`cert-${cert.id}`)
      if (!certElement) {
        alert('Certificate element not found')
        return
      }

      const canvas = await html2canvas(certElement)
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`certificate-${cert.id}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Failed to generate PDF')
    }
  }

  function handleViewDetails(cert: any) {
    router.push(`/verify/${cert.id}`)
  }

  function handleShowQR(cert: any) {
    setSelectedCert(cert)
    setShowQRModal(true)
  }

  function handleShare(cert: any, platform: string) {
    const url = `${window.location.origin}/verify/${cert.id}`
    const text = `Check out my verified blockchain certificate: ${cert.metadata?.name || 'Certificate'}`

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green/10 w-12 h-12 rounded-full flex items-center justify-center">
                <FiAward className="text-2xl text-green" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
                <p className="text-gray-600">
                  <DisplayName address={address} showAddress />
                </p>
              </div>
            </div>
            
            {/* Display Name Setting */}
            <button
              onClick={() => setShowNameForm(!showNameForm)}
              className="btn-secondary text-sm"
            >
              {displayName ? '✏️ Edit Name' : '➕ Set Display Name'}
            </button>
          </div>

          {/* Display Name Form */}
          {showNameForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-saffron-200 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Set Your Display Name
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Current: <strong>{displayName || 'Not set'}</strong>
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Enter your name (e.g., John Doe)"
                  className="input-field flex-1"
                />
                <button
                  onClick={() => setName({ args: [newDisplayName] })}
                  disabled={!newDisplayName || isSettingName}
                  className="btn-primary whitespace-nowrap"
                >
                  {isSettingName ? 'Saving...' : 'Save Name'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Your display name will be shown instead of your wallet address throughout the platform
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-saffron">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Certificates</p>
                <p className="text-3xl font-bold text-saffron">{stats.total}</p>
              </div>
              <div className="bg-saffron/10 w-12 h-12 rounded-full flex items-center justify-center">
                <FiAward className="text-2xl text-saffron" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Verified</p>
                <p className="text-3xl font-bold text-green">{stats.verified}</p>
              </div>
              <div className="bg-green/10 w-12 h-12 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-2xl text-green" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-navy">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Blockchain Secure</p>
                <p className="text-3xl font-bold text-navy">{stats.secure}</p>
              </div>
              <div className="bg-navy/10 w-12 h-12 rounded-full flex items-center justify-center">
                <FiShield className="text-2xl text-navy" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading your certificates..." />
          </div>
        )}

        {/* Certificates Grid */}
        {!isLoading && certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                id={`cert-${cert.id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-t-4 border-saffron"
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-br from-saffron/10 to-green/10 p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
                    <FiAward className="text-3xl text-saffron" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {cert.metadata?.name || cert.certificateType || 'Certificate'}
                  </h3>
                  {cert.metadata?.courseName && (
                    <p className="text-sm text-gray-600">{cert.metadata.courseName}</p>
                  )}
                </div>

                {/* Certificate Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Certificate ID:</span>
                      <span className="font-mono font-semibold">{cert.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-semibold">{cert.certificateType}</span>
                    </div>
                    {cert.metadata?.issueDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Issued:</span>
                        <span className="font-semibold">
                          {new Date(cert.metadata.issueDate * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {cert.metadata?.grade && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Grade:</span>
                        <span className="font-semibold text-green">{cert.metadata.grade}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewDetails(cert)}
                      className="w-full bg-saffron text-white py-2 px-4 rounded-lg hover:bg-saffron/90 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <FiEye />
                      View Details
                    </button>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleDownloadPDF(cert)}
                        className="bg-green/10 text-green py-2 px-3 rounded-lg hover:bg-green/20 transition-all font-medium text-sm flex items-center justify-center gap-1"
                        title="Download PDF"
                      >
                        <FiDownload />
                      </button>
                      <button
                        onClick={() => handleShowQR(cert)}
                        className="bg-navy/10 text-navy py-2 px-3 rounded-lg hover:bg-navy/20 transition-all font-medium text-sm flex items-center justify-center gap-1"
                        title="Show QR Code"
                      >
                        <FiShield />
                      </button>
                      <button
                        onClick={() => handleShare(cert, 'twitter')}
                        className="bg-saffron/10 text-saffron py-2 px-3 rounded-lg hover:bg-saffron/20 transition-all font-medium text-sm flex items-center justify-center gap-1"
                        title="Share"
                      >
                        <FiShare2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && certificates.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAward className="text-5xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 mb-6">
              You don't have any certificates on the blockchain yet.
            </p>
            <button
              onClick={() => router.push('/organizer')}
              className="btn-primary"
            >
              Get Your First Certificate
            </button>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedCert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-2xl" />
              </button>

              <h3 className="text-2xl font-bold mb-6 text-center">Certificate QR Code</h3>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-lg border-4 border-saffron inline-block">
                  <QRCode
                    value={`${window.location.origin}/verify/${selectedCert.id}${selectedCert.ipfsHash ? `?ipfs=${selectedCert.ipfsHash}` : ''}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Scan to verify certificate authenticity
                </p>
                {selectedCert.ipfsHash && (
                  <a
                    href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'ivory-bitter-gerbil-665.mypinata.cloud'}/ipfs/${selectedCert.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline block"
                  >
                    View IPFS Metadata →
                  </a>
                )}
                <p className="text-xs font-mono text-gray-500 break-all">
                  {window.location.origin}/verify/{selectedCert.id}
                </p>
              </div>

              <button
                onClick={() => setShowQRModal(false)}
                className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
