'use client'

import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'

export default function Alert({ type = 'info', message, onClose }) {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: FiCheckCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: FiXCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: FiAlertCircle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: FiInfo,
    },
  }

  const style = styles[type] || styles.info
  const Icon = style.icon

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-start space-x-3`}>
      <Icon className={`${style.text} w-5 h-5 mt-0.5 flex-shrink-0`} />
      <p className={`${style.text} flex-1 text-sm`}>{message}</p>
      {onClose && (
        <button onClick={onClose} className={`${style.text} hover:opacity-70`}>
          <FiX className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
