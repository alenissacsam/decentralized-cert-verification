'use client'

import { useState } from 'react'
import { useContracts } from '@/contexts/ContractContext'
import { useWeb3 } from '@/contexts/Web3Context'
import { FiAward, FiUpload, FiFileText, FiUsers, FiCheck, FiX } from 'react-icons/fi'
import Alert from '@/components/Alert'
import LoadingSpinner from '@/components/LoadingSpinner'
import { uploadJSONToIPFS } from '@/lib/ipfs'

// Certificate Templates
const TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional Certificate',
    description: 'Clean and formal design for professional courses',
    preview: '/templates/professional.png',
    colors: { primary: '#FF9933', secondary: '#138808', accent: '#000080' }
  },
  {
    id: 'academic',
    name: 'Academic Certificate',
    description: 'Traditional academic style with borders',
    preview: '/templates/academic.png',
    colors: { primary: '#000080', secondary: '#FF9933', accent: '#138808' }
  },
  {
    id: 'modern',
    name: 'Modern Certificate',
    description: 'Contemporary design with bold colors',
    preview: '/templates/modern.png',
    colors: { primary: '#138808', secondary: '#FF9933', accent: '#000080' }
  },
  {
    id: 'simple',
    name: 'Simple Certificate',
    description: 'Minimalist design with tricolor accent',
    preview: '/templates/simple.png',
    colors: { primary: '#FF9933', secondary: '#FFFFFF', accent: '#138808' }
  }
]

export default function OrganizerDashboard() {
  const { certificateSDK, isLoading } = useContracts()
  const { account, isConnected, connectWallet, userRole } = useWeb3()
  
  const [step, setStep] = useState('template') // template, form, confirm
  const [issueMode, setIssueMode] = useState('single') // single, batch
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [alert, setAlert] = useState(null)
  
  // Single Certificate Form
  const [formData, setFormData] = useState({
    recipientAddress: '',
    recipientName: '',
    courseName: '',
    issueDate: new Date().toISOString().split('T')[0],
    grade: '',
    additionalInfo: ''
  })
  
  // Batch Upload
  const [csvFile, setCSVFile] = useState(null)
  const [parsedAddresses, setParsedAddresses] = useState([])

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setStep('form')
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSingleIssue = async () => {
    if (!selectedTemplate) {
      setAlert({ type: 'error', message: 'Please select a template first' })
      return
    }

    if (!certificateSDK) {
      setAlert({ type: 'error', message: 'Certificate SDK not initialized. Please connect your wallet.' })
      return
    }

    // Validate all required fields (check for placeholder patterns like XXX, not 0x prefix)
    if (!formData.recipientAddress || formData.recipientAddress.trim() === '' || /X{3,}/.test(formData.recipientAddress)) {
      setAlert({ type: 'error', message: 'Please enter a valid recipient wallet address' })
      return
    }

    if (!formData.recipientName || formData.recipientName.trim() === '' || /X{3,}/.test(formData.recipientName)) {
      setAlert({ type: 'error', message: 'Please enter a valid recipient name' })
      return
    }

    if (!formData.courseName || formData.courseName.trim() === '' || /X{3,}/.test(formData.courseName)) {
      setAlert({ type: 'error', message: 'Please enter a valid course/program name' })
      return
    }

    // Validate Ethereum address format (allow any 0x address for testing)
    if (!/^0x[a-fA-F0-9]+$/.test(formData.recipientAddress)) {
      setAlert({ type: 'error', message: 'Invalid Ethereum address format. Must start with 0x followed by hex characters' })
      return
    }

    try {
      // Step 1: Prepare metadata
      const metadata = {
        name: `${formData.courseName} Certificate`,
        description: `Certificate awarded to ${formData.recipientName} for completing ${formData.courseName}`,
        certificateType: selectedTemplate.name,
        recipientName: formData.recipientName,
        recipientAddress: formData.recipientAddress,
        issuerName: account || 'Institution',
        issueDate: formData.issueDate,
        attributes: [
          { trait_type: 'Course', value: formData.courseName },
          { trait_type: 'Grade', value: formData.grade || 'N/A' },
          { trait_type: 'Template', value: selectedTemplate.name },
          { trait_type: 'Issue Date', value: formData.issueDate }
        ]
      }

      // Step 2: Upload metadata to IPFS
      setAlert({ type: 'info', message: 'Uploading metadata to IPFS...' })
      const { ipfsHash } = await uploadJSONToIPFS(metadata)

      // Step 3: Issue certificate on blockchain
      setAlert({ type: 'info', message: 'Submitting to blockchain...' })
      const result = await certificateSDK.issueCertificate({
        recipient: formData.recipientAddress,
        ipfsHash: ipfsHash,
        certType: selectedTemplate.name
      })

      if (result.success) {
        setAlert({ type: 'success', message: `Certificate issued successfully! TX: ${result.txHash}` })
        // Reset form
        setFormData({
          recipientAddress: '',
          recipientName: '',
          courseName: '',
          issueDate: new Date().toISOString().split('T')[0],
          grade: '',
          additionalInfo: ''
        })
        setStep('template')
        setSelectedTemplate(null)
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to issue certificate' })
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message })
    }
  }

  const parseCSVFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const lines = text.split('\n')
        const addresses = lines
          .map(line => line.split(',')[0].trim())
          .filter(addr => addr.length > 0 && addr !== 'address' && addr.startsWith('0x'))
        resolve(addresses)
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setCSVFile(file)
    try {
      const addresses = await parseCSVFile(file)
      setParsedAddresses(addresses)
      setAlert({ type: 'success', message: `Parsed ${addresses.length} addresses from CSV` })
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to parse CSV file' })
    }
  }

  const handleBatchIssue = async () => {
    if (!selectedTemplate || parsedAddresses.length === 0) {
      setAlert({ type: 'error', message: 'Please select template and upload CSV' })
      return
    }

    if (!certificateSDK) {
      setAlert({ type: 'error', message: 'Certificate SDK not initialized. Please connect your wallet.' })
      return
    }

    // Validate course name (check for placeholder patterns like XXX, not just X)
    if (!formData.courseName || formData.courseName.trim() === '' || /X{3,}/.test(formData.courseName)) {
      setAlert({ type: 'error', message: 'Please enter a valid course/program name for batch issuance' })
      return
    }

    // Validate all addresses (allow any 0x address for testing)
    const invalidAddresses = parsedAddresses.filter(addr => !/^0x[a-fA-F0-9]+$/.test(addr))
    if (invalidAddresses.length > 0) {
      setAlert({ type: 'error', message: `Found ${invalidAddresses.length} invalid address(es) in CSV. Must start with 0x followed by hex characters.` })
      return
    }

    try {
      // Step 1: Upload metadata to IPFS for each recipient
      setAlert({ type: 'info', message: `Uploading metadata to IPFS for ${parsedAddresses.length} certificates...` })
      
      const ipfsHashes = await Promise.all(
        parsedAddresses.map(async (address, index) => {
          const metadata = {
            name: `${formData.courseName} Certificate`,
            description: `Certificate awarded for completing ${formData.courseName}`,
            certificateType: selectedTemplate.name,
            recipientName: `Recipient ${index + 1}`,
            recipientAddress: address,
            issuerName: account || 'Institution',
            issueDate: new Date().toISOString().split('T')[0],
            attributes: [
              { trait_type: 'Course', value: formData.courseName },
              { trait_type: 'Template', value: selectedTemplate.name },
              { trait_type: 'Batch Number', value: `${index + 1} of ${parsedAddresses.length}` }
            ]
          }
          const { ipfsHash } = await uploadJSONToIPFS(metadata)
          return ipfsHash
        })
      )

      // Step 2: Batch issue certificates on blockchain
      setAlert({ type: 'info', message: 'Submitting batch to blockchain...' })
      const result = await certificateSDK.batchIssueCertificates(
        parsedAddresses,
        ipfsHashes,
        selectedTemplate.name
      )

      if (result.success) {
        setAlert({ type: 'success', message: `Batch issued ${parsedAddresses.length} certificates successfully! TX: ${result.txHash}` })
        // Reset
        setParsedAddresses([])
        setCSVFile(null)
        setStep('template')
        setSelectedTemplate(null)
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to batch issue' })
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message })
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <FiAward className="text-6xl text-saffron mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Organizer Dashboard</h2>
          <p className="text-gray-600 mb-6">Connect MetaMask to access the organizer dashboard and issue certificates</p>
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
              className="text-saffron hover:underline"
            >
              Install it here
            </a>
          </p>
        </div>
      </div>
    )
  }

  // Access control removed - all users can access organizer section
  // if (isConnected && userRole !== 'organizer') {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10 flex items-center justify-center p-4">
  //       <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border-2 border-red-500">
  //         <FiX className="text-6xl text-red-500 mx-auto mb-4" />
  //         <h2 className="text-2xl font-bold mb-4 text-gray-900">Access Denied</h2>
  //         <p className="text-gray-700 mb-4">
  //           Your wallet address is not authorized as an organizer.
  //         </p>
  //         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left">
  //           <p className="text-sm text-red-700 mb-2">
  //             <strong>Connected Wallet:</strong>
  //           </p>
  //           <p className="text-xs text-red-600 font-mono break-all">
  //             {account}
  //           </p>
  //         </div>
  //         <p className="text-gray-600 mb-6">
  //           To become an organizer, please register your wallet address with the platform administrator.
  //         </p>
  //         <div className="space-y-3">
  //           <a
  //             href="/"
  //             className="block w-full px-6 py-3 bg-gradient-to-r from-saffron to-green text-white rounded-lg font-semibold hover:shadow-lg transition-all"
  //           >
  //             Go to Homepage
  //           </a>
  //           <a
  //             href="/user"
  //             className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
  //           >
  //             Go to User Dashboard
  //           </a>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10">
      <div className="h-1 bg-tricolor-gradient"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Connected:</span> {account?.slice(0, 6)}...{account?.slice(-4)}
            </div>
          </div>
          
          {/* Mode Selector */}
          <div className="flex gap-4">
            <button
              onClick={() => setIssueMode('single')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                issueMode === 'single'
                  ? 'bg-saffron text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiFileText />
              Single Certificate
            </button>
            <button
              onClick={() => setIssueMode('batch')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                issueMode === 'batch'
                  ? 'bg-green text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiUsers />
              Batch Upload (CSV)
            </button>
          </div>
        </div>

        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Step 1: Template Selection */}
        {step === 'template' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Step 1: Choose Certificate Template
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group overflow-hidden border-2 border-transparent hover:border-saffron"
                >
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 50%, ${template.colors.accent} 100%)`
                      }}
                    ></div>
                    <FiAward className="text-6xl text-gray-400 group-hover:text-saffron transition-all relative z-10" />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="flex gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: template.colors.primary }}
                      ></div>
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: template.colors.secondary }}
                      ></div>
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: template.colors.accent }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 'form' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Step 2: Enter Certificate Details
              </h2>
              <button
                onClick={() => { setStep('template'); setSelectedTemplate(null); }}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <FiX /> Change Template
              </button>
            </div>

            {selectedTemplate && (
              <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center gap-4">
                <FiCheck className="text-2xl text-green" />
                <div>
                  <p className="font-semibold text-gray-900">Selected Template:</p>
                  <p className="text-saffron">{selectedTemplate.name}</p>
                </div>
              </div>
            )}

            {issueMode === 'single' ? (
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Wallet Address *
                    </label>
                    <input
                      type="text"
                      name="recipientAddress"
                      value={formData.recipientAddress}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-saffron focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-saffron focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Course/Program Name *
                    </label>
                    <input
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      placeholder="Web3 Development Bootcamp"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-saffron focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-saffron focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Grade/Score (Optional)
                      </label>
                      <input
                        type="text"
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        placeholder="A+ / 95%"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-saffron focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Any additional details..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-saffron focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    onClick={handleSingleIssue}
                    disabled={isLoading || !formData.recipientAddress || !formData.recipientName || !formData.courseName}
                    className="w-full px-6 py-4 bg-gradient-to-r from-saffron to-green text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Issuing Certificate...
                      </>
                    ) : (
                      <>
                        <FiAward />
                        Issue Certificate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Course/Program Name *
                    </label>
                    <input
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      placeholder="Web3 Development Bootcamp"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-saffron focus:outline-none"
                      required
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-saffron focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Upload CSV File with Recipient Addresses
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-saffron transition-all">
                      <FiUpload className="text-5xl text-gray-400 mx-auto mb-4" />
                      
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label
                        htmlFor="csv-upload"
                        className="cursor-pointer inline-block px-6 py-3 bg-saffron text-white rounded-lg font-semibold hover:bg-saffronDark transition-all"
                      >
                        Choose CSV File
                      </label>
                      
                      <p className="text-sm text-gray-500 mt-4">
                        CSV format: First column should contain wallet addresses
                      </p>
                    </div>

                    {csvFile && (
                      <div className="mt-4 p-4 bg-green/10 border border-green rounded-lg">
                        <p className="font-semibold text-green flex items-center gap-2">
                          <FiCheck /> File uploaded: {csvFile.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {parsedAddresses.length} addresses found
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleBatchIssue}
                    disabled={isLoading || !formData.courseName || parsedAddresses.length === 0}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green to-greenDark text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Issuing {parsedAddresses.length} Certificates...
                      </>
                    ) : (
                      <>
                        <FiUsers />
                        Issue {parsedAddresses.length} Certificates
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-1 bg-tricolor-gradient mt-12"></div>
    </div>
  )
}
