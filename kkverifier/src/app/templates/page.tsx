'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import {
  useCreateTemplate,
  useListPublicTemplates,
  useGetInstitutionTemplates,
  useGetTemplate,
  useInstitutionExists
} from '@/hooks/useContracts'
import { uploadJSONToIPFS } from '@/lib/ipfs'
import Alert from '@/components/Alert'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DisplayName } from '@/components/DisplayName'
import { FiPlus, FiEye, FiUsers, FiLock, FiImage, FiCheckCircle } from 'react-icons/fi'

export default function TemplatesPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'public' | 'mine'>('mine')

  // Check if institution
  const { exists: isInstitution } = useInstitutionExists(address)

  // Get templates
  const { templateIds: publicTemplateIds, isLoading: loadingPublic } = useListPublicTemplates()
  const { templateIds: myTemplateIds, isLoading: loadingMine } = useGetInstitutionTemplates(address)

  // Create template hook
  const {
    write: createTemplate,
    isLoading: isCreating,
    isSuccess: isCreated,
    data: createData
  } = useCreateTemplate()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Certificate',
    isPublic: false,
    primaryColor: '#FF9933', // Saffron
    secondaryColor: '#138808', // Green
    backgroundColor: '#FFFFFF',
  })

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }

    if (isInstitution === false) {
      setError('Only registered institutions can create templates. Please register first.')
    }
  }, [isConnected, isInstitution, router])

  useEffect(() => {
    if (isCreated && createData) {
      setSuccess('Template created successfully! It can now be used for issuing certificates.')
      setShowCreateForm(false)
      setFormData({
        name: '',
        description: '',
        category: 'Certificate',
        isPublic: false,
        primaryColor: '#FF9933',
        secondaryColor: '#138808',
        backgroundColor: '#FFFFFF',
      })
      // Templates will auto-refresh on next render
    }
  }, [isCreated, createData, formData.isPublic])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.name || !formData.category) {
      setError('Please fill in template name and category')
      return
    }

    try {
      // Prepare template metadata for IPFS
      const metadata = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        design: {
          colors: {
            primary: formData.primaryColor,
            secondary: formData.secondaryColor,
            background: formData.backgroundColor,
          },
          layout: 'standard',
          elements: [
            {
              type: 'text',
              content: '{{certificateName}}',
              position: { x: 50, y: 30 },
              style: { fontSize: 32, fontWeight: 'bold', color: formData.primaryColor }
            },
            {
              type: 'text',
              content: 'Presented to',
              position: { x: 50, y: 45 },
              style: { fontSize: 16, color: '#666' }
            },
            {
              type: 'text',
              content: '{{recipientName}}',
              position: { x: 50, y: 50 },
              style: { fontSize: 24, fontWeight: 'bold' }
            },
            {
              type: 'text',
              content: '{{courseName}}',
              position: { x: 50, y: 65 },
              style: { fontSize: 18 }
            },
          ]
        },
        createdAt: Date.now(),
        creator: address,
      }

      // Upload to IPFS
      const { ipfsHash } = await uploadJSONToIPFS(metadata)
      
      if (!ipfsHash) {
        throw new Error('Failed to upload template metadata to IPFS')
      }

      // Create template on blockchain
      await createTemplate({
        args: [
          ipfsHash,
          formData.isPublic,
          formData.category,
        ]
      })

    } catch (err: any) {
      console.error('Error creating template:', err)
      setError(err?.message || 'Failed to create template. Please try again.')
    }
  }

  if (!isConnected) {
    return null
  }

  if (isInstitution === false) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert type="warning">
            Only registered institutions can create templates. Please register your institution first.
          </Alert>
        </div>
      </div>
    )
  }

  const templates = viewMode === 'public' ? publicTemplateIds : myTemplateIds
  const isLoading = viewMode === 'public' ? loadingPublic : loadingMine

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📋 Certificate Templates
          </h1>
          <p className="text-gray-600">
            Create and manage reusable certificate templates for your institution
          </p>
        </div>

        {/* Alerts */}
        {success && <Alert type="success" className="mb-6">{success}</Alert>}
        {error && <Alert type="error" className="mb-6">{error}</Alert>}

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* View Toggle */}
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
            <button
              onClick={() => setViewMode('mine')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'mine'
                  ? 'bg-saffron-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <FiLock className="inline mr-1" />
              My Templates
            </button>
            <button
              onClick={() => setViewMode('public')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'public'
                  ? 'bg-saffron-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <FiUsers className="inline mr-1" />
              Public Templates
            </button>
          </div>

          {/* Create Button */}
          {viewMode === 'mine' && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary"
            >
              <FiPlus className="inline mr-2" />
              {showCreateForm ? 'Cancel' : 'Create Template'}
            </button>
          )}
        </div>

        {/* Create Template Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-saffron-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Template
            </h2>
            
            <form onSubmit={handleCreateTemplate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Professional Certificate"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="Certificate">Certificate</option>
                    <option value="Award">Award</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Recognition">Recognition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this template..."
                  rows={3}
                  className="input-field"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                    className="input-field h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                    className="input-field h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Background
                  </label>
                  <input
                    type="color"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={handleInputChange}
                    className="input-field h-12"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-saffron-500 focus:ring-saffron-400 rounded"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  Make this template public (visible to all institutions)
                </label>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary w-full py-4 text-lg"
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" className="inline mr-2" />
                    Creating Template...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="inline mr-2" />
                    Create Template
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Templates Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {viewMode === 'mine' ? 'My Templates' : 'Public Templates'}
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <LoadingSpinner />
              <p className="text-gray-600 mt-4">Loading templates...</p>
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((templateId) => (
                <TemplateCard key={templateId.toString()} templateId={Number(templateId)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiImage className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {viewMode === 'mine' ? 'No templates yet' : 'No public templates available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {viewMode === 'mine' 
                  ? 'Create your first template to get started'
                  : 'Check back later for public templates from other institutions'
                }
              </p>
              {viewMode === 'mine' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary"
                >
                  <FiPlus className="inline mr-2" />
                  Create Your First Template
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Individual Template Card Component
 */
function TemplateCard({ templateId }: { templateId: number }) {
  const { template, isLoading } = useGetTemplate(BigInt(templateId))

  if (isLoading) {
    return (
      <div className="border-2 border-gray-200 rounded-xl p-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (!template) return null

  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-saffron-300 hover:shadow-lg transition-all">
      {/* Preview */}
      <div className="h-32 bg-gradient-to-br from-saffron-50 to-green-50 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
        <div className="text-center">
          <FiImage className="text-4xl text-saffron-600 mx-auto mb-2" />
          <span className="text-sm text-gray-600">Template #{templateId}</span>
        </div>
        
        {/* Public/Private Badge */}
        <div className="absolute top-2 right-2">
          {template.isPublic ? (
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <FiUsers className="text-xs" />
              Public
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              <FiLock className="text-xs" />
              Private
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <h3 className="font-bold text-gray-900 text-lg mb-1">
        Template #{templateId}
      </h3>
      <p className="text-sm text-gray-600 capitalize mb-3">
        {template.category}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-500">Used:</span>{' '}
          <span className="font-semibold text-gray-900">
            {template.usageCount?.toString() || '0'} times
          </span>
        </div>
        <div>
          <DisplayName address={template.creator} className="text-xs text-gray-500" />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => window.location.href = '/issue'}
        className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-saffron-500 hover:text-white text-gray-700 rounded-lg transition-colors font-medium text-sm"
      >
        <FiEye className="inline mr-1" />
        Use Template
      </button>
    </div>
  )
}
