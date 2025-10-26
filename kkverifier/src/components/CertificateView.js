'use client'

import { formatDate, formatAddress } from '@/utils/helpers'
import { FiAward, FiCalendar, FiUser, FiHash, FiFileText } from 'react-icons/fi'

export default function CertificateView({ certificate }) {
  return (
    <div
      id="certificate-view"
      className="bg-white rounded-lg shadow-2xl p-8 md:p-12 max-w-4xl mx-auto"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
      }}
    >
      {/* Decorative Border */}
      <div className="absolute inset-4 border-4 border-white border-opacity-30 rounded-lg pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-6">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="bg-white bg-opacity-20 p-4 rounded-full">
            <FiAward className="w-16 h-16 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Certificate of Achievement
        </h1>

        <div className="h-1 w-32 bg-white bg-opacity-50 mx-auto rounded-full" />

        {/* Certificate Name */}
        <div className="my-8">
          <p className="text-white text-opacity-90 text-lg mb-2">This is to certify that</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {formatAddress(certificate.recipient, 10, 8)}
          </h2>
          <p className="text-white text-opacity-90 text-lg mt-4">has successfully completed</p>
          <h3 className="text-2xl md:text-3xl font-bold text-accent mt-2">
            {certificate.certName}
          </h3>
        </div>

        {/* Details */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-white text-opacity-80 mb-1">
                <FiFileText className="w-4 h-4" />
                <span className="text-sm font-medium">Certificate Type</span>
              </div>
              <p className="text-white font-semibold">{certificate.certType}</p>
            </div>

            <div>
              <div className="flex items-center space-x-2 text-white text-opacity-80 mb-1">
                <FiCalendar className="w-4 h-4" />
                <span className="text-sm font-medium">Issue Date</span>
              </div>
              <p className="text-white font-semibold">{formatDate(certificate.issueDate)}</p>
            </div>

            {certificate.gradeInfo && (
              <div>
                <div className="flex items-center space-x-2 text-white text-opacity-80 mb-1">
                  <FiAward className="w-4 h-4" />
                  <span className="text-sm font-medium">Grade</span>
                </div>
                <p className="text-white font-semibold">{certificate.gradeInfo}</p>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2 text-white text-opacity-80 mb-1">
                <FiHash className="w-4 h-4" />
                <span className="text-sm font-medium">Certificate ID</span>
              </div>
              <p className="text-white font-semibold">#{certificate.id}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white border-opacity-20">
            <div className="flex items-center space-x-2 text-white text-opacity-80 mb-1">
              <FiFileText className="w-4 h-4" />
              <span className="text-sm font-medium">Course Details</span>
            </div>
            <p className="text-white text-sm">{certificate.courseDetails}</p>
          </div>
        </div>

        {/* Issuer */}
        <div className="pt-6 border-t border-white border-opacity-20">
          <div className="flex items-center justify-center space-x-2 text-white text-opacity-90">
            <FiUser className="w-4 h-4" />
            <span className="text-sm">Issued by: {formatAddress(certificate.issuer)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white text-opacity-70 mt-8">
          <p>This certificate is verified on the blockchain</p>
          <p className="mt-1 font-mono text-xs break-all">
            Hash: {certificate.certHash?.slice(0, 20)}...
          </p>
        </div>
      </div>
    </div>
  )
}
