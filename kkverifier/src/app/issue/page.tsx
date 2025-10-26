'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { 
  useIssueCertificate,
  useIssueCertificateWithTemplate,
  useBatchIssueCertificates,
  useBatchIssueCertificatesWithTemplates,
  useIsAuthorizedInstitution,
  useIsVerifiedInstitution 
} from '@/hooks/useContracts'
import { uploadJSONToIPFS } from '@/lib/ipfs'
// import { supabase } from '@/lib/supabase' // Removed - using blockchain only
import { isValidAddress } from '@/utils/helpers'
import Alert from '@/components/Alert'
import LoadingSpinner from '@/components/LoadingSpinner'
import { TemplateSelector } from '@/components/TemplateSelector'
import { FiAward, FiUser, FiUsers, FiCalendar, FiFileText, FiUpload, FiCheckCircle } from 'react-icons/fi'
import Papa from 'papaparse'

export default function IssuePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [isCheckingOrg, setIsCheckingOrg] = useState(true)
  const [issueMode, setIssueMode] = useState('single') // 'single' or 'batch'
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if authorized institution
  const { isAuthorized } = useIsAuthorizedInstitution(address)
  const { isVerified } = useIsVerifiedInstitution(address)

  // Issue certificate hooks
  const { 
    write: issueCertificate, 
    isLoading: isIssuingCert,
    isSuccess: isIssuedCert,
    data: issueData 
  } = useIssueCertificate()

  const {
    write: issueCertificateWithTemplate,
    isLoading: isIssuingWithTemplate,
    isSuccess: isIssuedWithTemplate,
    data: issueWithTemplateData
  } = useIssueCertificateWithTemplate()

  const {
    write: batchIssueCertificates,
    isLoading: isBatchIssuing,
    isSuccess: isBatchIssued,
    data: batchData
  } = useBatchIssueCertificates()

  const {
    write: batchIssueCertificatesWithTemplates,
    isLoading: isBatchIssuingWithTemplates,
    isSuccess: isBatchIssuedWithTemplates,
    data: batchWithTemplatesData
  } = useBatchIssueCertificatesWithTemplates()

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  // Single certificate form
  const [formData, setFormData] = useState({
    recipient: '',
    certType: 'Course Completion',
    certName: '',
    courseName: '',
    courseDetails: '',
    gradeInfo: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  })

  // Batch form
  const [batchRecipients, setBatchRecipients] = useState<string>('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploadMethod, setUploadMethod] = useState('manual') // 'manual' or 'csv'
  const [parsedCSV, setParsedCSV] = useState<any[]>([])

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }

    // Access control removed - all users can access issue page
    if (isAuthorized !== undefined && isVerified !== undefined) {
      setIsCheckingOrg(false)
    }
  }, [isConnected, isAuthorized, isVerified, router])

  // Handle successful issuance
  useEffect(() => {
    if ((isIssuedCert && issueData) || (isIssuedWithTemplate && issueWithTemplateData)) {
      const txHash = issueData || issueWithTemplateData
      setSuccess(`Certificate issued successfully! Transaction hash: ${txHash}`)
      // Reset form
      setFormData({
        recipient: '',
        certType: 'Course Completion',
        certName: '',
        courseName: '',
        courseDetails: '',
        gradeInfo: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
      })
      setSelectedTemplate(null)
    }
  }, [isIssuedCert, issueData, isIssuedWithTemplate, issueWithTemplateData])

  useEffect(() => {
    if ((isBatchIssued && batchData) || (isBatchIssuedWithTemplates && batchWithTemplatesData)) {
      const txHash = batchData || batchWithTemplatesData
      setSuccess(`Batch certificates issued successfully! Transaction hash: ${txHash}`)
      // Reset batch form
      setBatchRecipients('')
      setCsvFile(null)
      setParsedCSV([])
      setSelectedTemplate(null)
    }
  }, [isBatchIssued, batchData, isBatchIssuedWithTemplates, batchWithTemplatesData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setParsedCSV(results.data)
        setError(null)
        setSuccess(`CSV parsed successfully! Found ${results.data.length} recipients.`)
      },
      error: (error) => {
        setError(`CSV parsing error: ${error.message}`)
      }
    })
  }

  async function handleSingleIssue(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!isValidAddress(formData.recipient)) {
      setError('Please enter a valid recipient address')
      return
    }

    if (!formData.certName || !formData.courseName) {
      setError('Please fill in all required fields')
      return
    }

    try {
      // Prepare metadata for IPFS
      const metadata = {
        name: formData.certName,
        description: `Certificate for ${formData.courseName}`,
        certificateType: formData.certType,
        recipient: formData.recipient,
        courseName: formData.courseName,
        courseDetails: formData.courseDetails,
        grade: formData.gradeInfo,
        issueDate: new Date(formData.issueDate).getTime() / 1000,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).getTime() / 1000 : 0,
        issuer: address,
        timestamp: Date.now(),
      }

      // Upload to IPFS
      const { ipfsHash } = await uploadJSONToIPFS(metadata)
      
      if (!ipfsHash) {
        throw new Error('Failed to upload metadata to IPFS')
      }

      // Issue certificate on blockchain - with or without template
      if (selectedTemplate !== null) {
        await issueCertificateWithTemplate({
          args: [
            formData.recipient,
            ipfsHash,
            formData.certType,
            BigInt(selectedTemplate),
          ]
        })
      } else {
        await issueCertificate({
          args: [
            formData.recipient,
            ipfsHash,
            formData.certType,
          ]
        })
      }

      // Store in Supabase for faster queries
      try {
        const { error: dbError } = await supabase
          .from('certificates')
          .insert({
            certificate_id: null, // Will be updated after blockchain confirmation
            recipient_address: formData.recipient,
            issuer_address: address,
            certificate_type: formData.certType,
            ipfs_hash: ipfsHash,
            metadata: metadata,
            issued_at: new Date().toISOString(),
          })

        if (dbError) {
          console.error('Supabase insert error:', dbError)
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Non-blocking - continue even if DB fails
      }

    } catch (err: any) {
      console.error('Error issuing certificate:', err)
      setError(err?.message || 'Failed to issue certificate. Please try again.')
    }
  }

  async function handleBatchIssue(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    let recipientAddresses: string[] = []

    // Parse recipients based on upload method
    if (uploadMethod === 'manual') {
      recipientAddresses = batchRecipients
        .split('\n')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0)
    } else if (uploadMethod === 'csv' && parsedCSV.length > 0) {
      recipientAddresses = parsedCSV
        .map((row: any) => row.address || row.wallet || row.recipient)
        .filter(addr => addr && addr.length > 0)
    }

    // Validation
    if (recipientAddresses.length === 0) {
      setError('Please provide at least one recipient address')
      return
    }

    const invalidAddresses = recipientAddresses.filter(addr => !isValidAddress(addr))
    if (invalidAddresses.length > 0) {
      setError(`Invalid addresses found: ${invalidAddresses.join(', ')}`)
      return
    }

    if (!formData.certName || !formData.courseName) {
      setError('Please fill in certificate name and course name')
      return
    }

    try {
      // Prepare metadata for IPFS
      const metadata = {
        name: formData.certName,
        description: `Certificate for ${formData.courseName}`,
        certificateType: formData.certType,
        courseName: formData.courseName,
        courseDetails: formData.courseDetails,
        issueDate: new Date(formData.issueDate).getTime() / 1000,
        issuer: address,
        timestamp: Date.now(),
        batchCount: recipientAddresses.length,
      }

      // Upload to IPFS
      const { ipfsHash } = await uploadJSONToIPFS(metadata)
      
      if (!ipfsHash) {
        throw new Error('Failed to upload metadata to IPFS')
      }

      // Create array of IPFS hashes (same hash for all in batch)
      const ipfsHashes = recipientAddresses.map(() => ipfsHash)
      const certTypes = recipientAddresses.map(() => formData.certType)

      // Issue batch certificates on blockchain
      await batchIssueCertificates({
        args: [
          recipientAddresses,
          ipfsHashes,
          certTypes,
        ]
      })

      // Store in Supabase for faster queries
      try {
        const insertData = recipientAddresses.map(recipient => ({
          certificate_id: null,
          recipient_address: recipient,
          issuer_address: address,
          certificate_type: formData.certType,
          ipfs_hash: ipfsHash,
          metadata: { ...metadata, recipient },
          issued_at: new Date().toISOString(),
        }))

        const { error: dbError } = await supabase
          .from('certificates')
          .insert(insertData)

        if (dbError) {
          console.error('Supabase batch insert error:', dbError)
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
      }

    } catch (err: any) {
      console.error('Error issuing batch certificates:', err)
      setError(err?.message || 'Failed to issue batch certificates. Please try again.')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access this page.</p>
        </div>
      </div>
    )
  }

  if (isCheckingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Checking organization status..." />
      </div>
    )
  }

  // Access control removed - all users can access
  // if (!isAuthorized || !isVerified) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center p-4">
  //       <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
  //         <div className="bg-saffron/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <FiAward className="text-3xl text-saffron" />
  //         </div>
  //         <h2 className="text-2xl font-bold mb-4">Authorization Required</h2>
  //         <p className="text-gray-600 mb-6">
  //           Only verified organizations can issue certificates. Please register your organization first.
  //         </p>
  //         <button
  //           onClick={() => router.push('/organizer')}
  //           className="btn-primary"
  //         >
  //           Register Organization
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-white rounded-full shadow-lg border-2 border-saffron">
            <FiAward className="text-2xl text-saffron" />
            <span className="text-xl font-bold text-gray-900">Issue Certificates</span>
          </div>
          <p className="text-gray-600">Issue certificates to recipients on the blockchain</p>
        </div>

        {/* Alerts */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Mode Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIssueMode('single')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                issueMode === 'single'
                  ? 'bg-saffron text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiUser className="inline mr-2" />
              Single Certificate
            </button>
            <button
              onClick={() => setIssueMode('batch')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                issueMode === 'batch'
                  ? 'bg-saffron text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Batch Certificates
            </button>
          </div>

          {/* Single Certificate Form */}
          {issueMode === 'single' && (
            <form onSubmit={handleSingleIssue} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Address *
                </label>
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificate Type *
                </label>
                <select
                  name="certType"
                  value={formData.certType}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="Course Completion">Course Completion</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Participation">Participation</option>
                  <option value="Recognition">Recognition</option>
                </select>
              </div>

              {/* Template Selector */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                <TemplateSelector 
                  value={selectedTemplate} 
                  onChange={setSelectedTemplate}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Certificate Name *
                  </label>
                  <input
                    type="text"
                    name="certName"
                    value={formData.certName}
                    onChange={handleInputChange}
                    placeholder="Web3 Development Certificate"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    placeholder="Advanced Blockchain Development"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Details
                </label>
                <textarea
                  name="courseDetails"
                  value={formData.courseDetails}
                  onChange={handleInputChange}
                  placeholder="Course description, duration, topics covered..."
                  rows={3}
                  className="input-field"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade/Score
                  </label>
                  <input
                    type="text"
                    name="gradeInfo"
                    value={formData.gradeInfo}
                    onChange={handleInputChange}
                    placeholder="A+ / 95%"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isIssuingCert || isIssuingWithTemplate}
                className="btn-primary w-full py-4 text-lg"
              >
                {(isIssuingCert || isIssuingWithTemplate) ? (
                  <>
                    <LoadingSpinner size="sm" className="inline mr-2" />
                    Issuing Certificate...
                  </>
                ) : (
                  <>
                    <FiAward className="inline mr-2" />
                    Issue Certificate{selectedTemplate !== null ? ' with Template' : ''}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Batch Certificates Form */}
          {issueMode === 'batch' && (
            <form onSubmit={handleBatchIssue} className="space-y-6">
              {/* Upload Method Selection */}
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setUploadMethod('manual')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    uploadMethod === 'manual'
                      ? 'bg-green text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('csv')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    uploadMethod === 'csv'
                      ? 'bg-green text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  CSV Upload
                </button>
              </div>

              {/* Recipients Input */}
              {uploadMethod === 'manual' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipient Addresses (one per line) *
                  </label>
                  <textarea
                    value={batchRecipients}
                    onChange={(e) => setBatchRecipients(e.target.value)}
                    placeholder="0x123...&#10;0x456...&#10;0x789..."
                    rows={6}
                    className="input-field font-mono text-sm"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {batchRecipients.split('\n').filter(a => a.trim()).length} addresses
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload CSV File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-saffron transition-colors">
                    <FiUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <span className="text-saffron font-semibold hover:underline">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">CSV with 'address' column</p>
                    {csvFile && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-green">
                        <FiCheckCircle />
                        <span>{csvFile.name} ({parsedCSV.length} recipients)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certificate Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Certificate Name *
                  </label>
                  <input
                    type="text"
                    name="certName"
                    value={formData.certName}
                    onChange={handleInputChange}
                    placeholder="Web3 Development Certificate"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    placeholder="Advanced Blockchain Development"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificate Type *
                </label>
                <select
                  name="certType"
                  value={formData.certType}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="Course Completion">Course Completion</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Participation">Participation</option>
                  <option value="Recognition">Recognition</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Details
                </label>
                <textarea
                  name="courseDetails"
                  value={formData.courseDetails}
                  onChange={handleInputChange}
                  placeholder="Course description, duration, topics covered..."
                  rows={3}
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={isBatchIssuing}
                className="btn-primary w-full py-4 text-lg"
              >
                {isBatchIssuing ? (
                  <>
                    <LoadingSpinner size="sm" className="inline mr-2" />
                    Issuing Batch Certificates...
                  </>
                ) : (
                  <>
                    <FiUsers className="inline mr-2" />
                    Issue Batch Certificates
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All certificates are stored on Sepolia blockchain</li>
            <li>• Metadata is stored on IPFS for decentralization</li>
            <li>• Recipients will be able to view and download their certificates</li>
            <li>• For CSV batch upload, ensure the file has an 'address' column</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
