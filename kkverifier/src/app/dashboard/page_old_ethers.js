'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/contexts/Web3Context'
import { useContracts } from '@/contexts/ContractContext'
import CertificateCard from '@/components/CertificateCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import Alert from '@/components/Alert'
import { FiAward, FiTrendingUp, FiClock, FiPlus } from 'react-icons/fi'

export default function DashboardPage() {
  const router = useRouter()
  const { account, isConnected } = useWeb3()
  const { certificateSDK, badgeSDK } = useContracts()
  const [certificates, setCertificates] = useState([])
  const [badges, setBadges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
  })

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }

    if (account && certificateSDK) {
      loadDashboardData()
    }
  }, [account, certificateSDK, isConnected])

  async function loadDashboardData() {
    setIsLoading(true)
    setError(null)

    try {
      // Load user certificates
      const userCerts = await certificateSDK.getUserCertificates(account)
      setCertificates(userCerts)

      // Calculate stats
      const total = userCerts.length
      const active = userCerts.filter((c) => c.status === 0).length
      const expired = userCerts.filter((c) => c.status === 2).length

      setStats({ total, active, expired })

      // Load badges if available
      if (badgeSDK) {
        const userBadges = await badgeSDK.getUserBadges(account)
        setBadges(userBadges)
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleViewCertificate(cert) {
    router.push(`/verify/${cert.id}`)
  }

  function handleDownloadCertificate(cert) {
    router.push(`/verify/${cert.id}`)
  }

  function handleShareCertificate(cert) {
    router.push(`/verify/${cert.id}`)
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">My Dashboard</h1>
          <p className="text-gray-600">
            Manage your certificates and achievements
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Certificates</p>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
              </div>
              <FiAward className="w-12 h-12 text-primary opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Certificates</p>
                <p className="text-3xl font-bold text-secondary">{stats.active}</p>
              </div>
              <FiTrendingUp className="w-12 h-12 text-secondary opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Expired Certificates</p>
                <p className="text-3xl font-bold text-gray-500">{stats.expired}</p>
              </div>
              <FiClock className="w-12 h-12 text-gray-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Loading */}
        {isLoading && <LoadingSpinner text="Loading your certificates..." />}

        {/* Certificates Grid */}
        {!isLoading && certificates.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">My Certificates</h2>
              <button
                onClick={() => router.push('/issue')}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <FiPlus />
                <span>Issue New</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  onView={handleViewCertificate}
                  onDownload={handleDownloadCertificate}
                  onShare={handleShareCertificate}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Certificates */}
        {!isLoading && certificates.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiAward className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No certificates yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't received any certificates yet. Check back later!
            </p>
            <button
              onClick={() => router.push('/issue')}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center space-x-2"
            >
              <FiPlus />
              <span>Issue Your First Certificate</span>
            </button>
          </div>
        )}

        {/* Badges Section (if available) */}
        {badges.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-dark mb-6">My Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition"
                >
                  <div className="bg-accent w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <FiAward className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
