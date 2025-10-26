'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/contexts/Web3Context'
import { useContracts } from '@/contexts/ContractContext'
import { isValidAddress, isValidEmail, parseContractError } from '@/utils/helpers'
import Alert from '@/components/Alert'
import LoadingSpinner from '@/components/LoadingSpinner'
import { FiAward, FiUser, FiUsers, FiCalendar, FiFileText } from 'react-icons/fi'

export default function IssuePage() {
  const router = useRouter()
  const { account, isConnected } = useWeb3()
  const { certificateSDK, organizationSDK } = useContracts()
  const [isOrganization, setIsOrganization] = useState(false)
  const [isCheckingOrg, setIsCheckingOrg] = useState(true)
  const [issueMode, setIssueMode] = useState('single') // 'single' or 'batch'
  const [isIssuing, setIsIssuing] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  // Single certificate form
  const [formData, setFormData] = useState({
    recipient: '',
    certType: 'Course Completion',
    certName: '',
    courseDetails: '',
    gradeInfo: '',
    issueDate: Math.floor(Date.now() / 1000),
    expiryDate: 0,
  })

  // Batch form
  const [batchData, setBatchData] = useState({
    recipients: '',
    certType: 'Course Completion',
    certName: '',
    courseDetails: '',
  })
  const [csvFile, setCsvFile] = useState(null)
  const [uploadMethod, setUploadMethod] = useState('manual') // 'manual' or 'csv'

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }

    if (account && organizationSDK) {
      checkOrganizationStatus()
    }
  }, [account, organizationSDK, isConnected])

  async function checkOrganizationStatus() {
    setIsCheckingOrg(true)
    try {
      const isVerified = await organizationSDK.isVerifiedOrganization(account)
      setIsOrganization(isVerified)
      
      if (!isVerified) {
        setError(
          'Only verified organizations can issue certificates. Please register and get verified first.'
        )
      }
    } catch (err) {
      console.error('Error checking organization status:', err)
    } finally {
      setIsCheckingOrg(false)
    }
  }

  async function handleSingleIssue(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!isValidAddress(formData.recipient)) {
      setError('Please enter a valid recipient address')
      return
    }

    if (!formData.certName || !formData.courseDetails) {
      setError('Please fill in all required fields')
      return
    }

    setIsIssuing(true)

    try {
      const result = await certificateSDK.issueCertificate(formData)

      if (result.success) {
        setSuccess(
          `Certificate issued successfully! Certificate ID: ${result.certId}. Transaction: ${result.txHash}`
        )
        // Reset form
        setFormData({
          recipient: '',
          certType: 'Course Completion',
          certName: '',
          courseDetails: '',
          gradeInfo: '',
          issueDate: Math.floor(Date.now() / 1000),
          expiryDate: 0,
        })

        // Redirect to certificate after a delay
        setTimeout(() => {
          router.push(`/verify/${result.certId}`)
        }, 3000)
      } else {
        setError(parseContractError(result.error))
      }
    } catch (err) {
      setError('Error issuing certificate: ' + parseContractError(err))
    } finally {
      setIsIssuing(false)
    }
  }

  async function parseCSVFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const lines = text.split('\n')
        const addresses = lines
          .map(line => line.split(',')[0].trim()) // Get first column
          .filter(addr => addr.length > 0 && addr !== 'address') // Remove header and empty
        resolve(addresses)
      }
      reader.onerror = () => reject(new Error('Failed to read CSV file'))
      reader.readAsText(file)
    })
  }

  function handleCSVUpload(e) {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file')
        return
      }
      setCsvFile(file)
    }
  }

  async function handleBatchIssue(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    let recipients = []
    
    // Parse recipients based on upload method
    if (uploadMethod === 'csv' && csvFile) {
      recipients = await parseCSVFile(csvFile)
    } else {
      recipients = batchData.recipients
        .split('\n')
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0)
    }

    // Validation
    if (recipients.length === 0) {
      setError('Please enter at least one recipient address')
      return
    }

    if (recipients.length > 100) {
      setError('Maximum 100 recipients per batch')
      return
    }

    for (const addr of recipients) {
      if (!isValidAddress(addr)) {
        setError(`Invalid address: ${addr}`)
        return
      }
    }

    if (!batchData.certName || !batchData.courseDetails) {
      setError('Please fill in all required fields')
      return
    }

    setIsIssuing(true)

    try {
      const result = await certificateSDK.batchIssueCertificates(recipients, batchData)

      if (result.success) {
        setSuccess(
          `Batch certificates issued successfully to ${recipients.length} recipients! Transaction: ${result.txHash}`
        )
        // Reset form
        setBatchData({
          recipients: '',
          certType: 'Course Completion',
          certName: '',
          courseDetails: '',
        })
      } else {
        setError(parseContractError(result.error))
      }
    } catch (err) {
      setError('Error issuing batch certificates: ' + parseContractError(err))
    } finally {
      setIsIssuing(false)
    }
  }

  if (!isConnected) {
    return null
  }

  if (isCheckingOrg) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <LoadingSpinner text="Checking organization status..." />
      </div>
    )
  }

  if (!isOrganization) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert
            type="warning"
            message="Only verified organizations can issue certificates. Please register as an organization and get verified by an admin first."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark mb-4">Issue Certificate</h1>
          <p className="text-xl text-gray-600">
            Create and issue blockchain-verified certificates
          </p>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setIssueMode('single')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition ${
                issueMode === 'single'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiUser />
              <span className="font-medium">Single Certificate</span>
            </button>
            <button
              onClick={() => setIssueMode('batch')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition ${
                issueMode === 'batch'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiUsers />
              <span className="font-medium">Batch Issue</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Single Certificate Form */}
        {issueMode === 'single' && (
          <form onSubmit={handleSingleIssue} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address *
              </label>
              <input
                type="text"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Type *
              </label>
              <select
                value={formData.certType}
                onChange={(e) => setFormData({ ...formData, certType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Course Completion">Course Completion</option>
                <option value="Hackathon Winner">Hackathon Winner</option>
                <option value="Hackathon Participant">Hackathon Participant</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Achievement">Achievement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Name *
              </label>
              <input
                type="text"
                value={formData.certName}
                onChange={(e) => setFormData({ ...formData, certName: e.target.value })}
                placeholder="e.g., Web3 Development Bootcamp"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Details *
              </label>
              <textarea
                value={formData.courseDetails}
                onChange={(e) => setFormData({ ...formData, courseDetails: e.target.value })}
                placeholder="Describe the course, program, or achievement..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade/Performance (Optional)
              </label>
              <input
                type="text"
                value={formData.gradeInfo}
                onChange={(e) => setFormData({ ...formData, gradeInfo: e.target.value })}
                placeholder="e.g., A+, Excellent, 95%"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isIssuing}
              className="w-full bg-primary text-white py-4 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isIssuing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Issuing Certificate...</span>
                </>
              ) : (
                <>
                  <FiAward />
                  <span>Issue Certificate</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Batch Issue Form */}
        {issueMode === 'batch' && (
          <form onSubmit={handleBatchIssue} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Upload Method Selector */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How do you want to add recipients?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('manual')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                    uploadMethod === 'manual'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary'
                  }`}
                >
                  ✍️ Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('csv')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                    uploadMethod === 'csv'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary'
                  }`}
                >
                  📄 CSV Upload
                </button>
              </div>
            </div>

            {/* Manual Entry */}
            {uploadMethod === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Addresses * (One per line, max 100)
                </label>
                <textarea
                  value={batchData.recipients}
                  onChange={(e) => setBatchData({ ...batchData, recipients: e.target.value })}
                  placeholder="0x123...&#10;0x456...&#10;0x789..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {batchData.recipients.split('\n').filter((a) => a.trim()).length} addresses
                </p>
              </div>
            )}

            {/* CSV Upload */}
            {uploadMethod === 'csv' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File * (Max 100 recipients)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csv-upload"
                    required
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-1">
                      {csvFile ? csvFile.name : 'Click to upload CSV file'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Format: Each row should contain wallet address in first column
                    </p>
                  </label>
                </div>
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-800 font-medium mb-1">📋 CSV Format Example:</p>
                  <pre className="text-xs font-mono text-gray-700">
{`address
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed
0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359`}
                  </pre>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Type *
              </label>
              <select
                value={batchData.certType}
                onChange={(e) => setBatchData({ ...batchData, certType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Course Completion">Course Completion</option>
                <option value="Hackathon Winner">Hackathon Winner</option>
                <option value="Hackathon Participant">Hackathon Participant</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Name *
              </label>
              <input
                type="text"
                value={batchData.certName}
                onChange={(e) => setBatchData({ ...batchData, certName: e.target.value })}
                placeholder="e.g., Blockchain Hackathon 2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Details *
              </label>
              <textarea
                value={batchData.courseDetails}
                onChange={(e) => setBatchData({ ...batchData, courseDetails: e.target.value })}
                placeholder="Describe the event or course..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isIssuing}
              className="w-full bg-primary text-white py-4 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isIssuing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Issuing Certificates...</span>
                </>
              ) : (
                <>
                  <FiAward />
                  <span>Issue Batch Certificates</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
