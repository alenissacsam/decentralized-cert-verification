'use client'

import { formatDate, getCertificateStatusLabel, formatAddress } from '@/utils/helpers'
import { FiAward, FiUser, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi'

export default function CertificateCard({ certificate, onView, onDownload, onShare }) {
  const statusInfo = getCertificateStatusLabel(certificate.status)

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition border border-gray-200 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 text-white">
            <FiAward className="w-6 h-6" />
            <h3 className="text-lg font-bold truncate">{certificate.certName}</h3>
          </div>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              statusInfo.color === 'green'
                ? 'bg-green-100 text-green-800'
                : statusInfo.color === 'red'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm text-gray-500">Certificate Type</p>
          <p className="font-medium text-gray-900">{certificate.certType}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Course Details</p>
          <p className="text-gray-700 text-sm line-clamp-2">{certificate.courseDetails}</p>
        </div>

        {certificate.gradeInfo && (
          <div>
            <p className="text-sm text-gray-500">Grade</p>
            <p className="font-medium text-gray-900">{certificate.gradeInfo}</p>
          </div>
        )}

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <FiCalendar className="w-4 h-4" />
            <span>{formatDate(certificate.issueDate)}</span>
          </div>
          {certificate.expiryDate > 0 && (
            <div className="flex items-center space-x-1">
              <FiClock className="w-4 h-4" />
              <span>Expires: {formatDate(certificate.expiryDate)}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FiUser className="w-3 h-3" />
              <span>From: {formatAddress(certificate.issuer)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiCheckCircle className="w-3 h-3" />
              <span>ID: #{certificate.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-4 py-3 flex space-x-2">
        <button
          onClick={() => onView(certificate)}
          className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          View
        </button>
        <button
          onClick={() => onDownload(certificate)}
          className="flex-1 bg-white text-primary border border-primary py-2 rounded-lg hover:bg-primary hover:text-white transition text-sm font-medium"
        >
          Download
        </button>
        <button
          onClick={() => onShare(certificate)}
          className="px-4 bg-white text-gray-700 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
        >
          Share
        </button>
      </div>
    </div>
  )
}
