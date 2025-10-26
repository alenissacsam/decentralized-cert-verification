'use client'

import { useGetName } from '@/hooks/useContracts';
import { formatAddress } from '@/utils/helpers';

interface DisplayNameProps {
  address: string | undefined;
  showAddress?: boolean; // Show truncated address alongside name
  className?: string;
  fallbackClassName?: string;
}

/**
 * DisplayName component - Shows human-readable names from NameRegistry
 * Falls back to truncated address if no name is set
 * 
 * @example
 * <DisplayName address="0x1234..." /> 
 * // Shows: "MIT University" or "0x1234...5678"
 * 
 * <DisplayName address="0x1234..." showAddress />
 * // Shows: "MIT University (0x1234...5678)"
 */
export function DisplayName({ 
  address, 
  showAddress = false, 
  className = '',
  fallbackClassName = 'text-gray-600'
}: DisplayNameProps) {
  const { displayName, isLoading } = useGetName(address);

  if (!address) {
    return <span className={fallbackClassName}>Unknown</span>;
  }

  if (isLoading) {
    return (
      <span className={`${className} animate-pulse`}>
        {formatAddress(address)}
      </span>
    );
  }

  // If name exists and is not empty
  if (displayName && displayName.length > 0) {
    return (
      <span className={className} title={address}>
        <span className="font-medium">{displayName}</span>
        {showAddress && (
          <span className="text-gray-400 text-sm ml-2">
            ({formatAddress(address)})
          </span>
        )}
      </span>
    );
  }

  // Fallback to truncated address
  return (
    <span className={fallbackClassName} title={address}>
      {formatAddress(address)}
    </span>
  );
}

/**
 * DisplayNameWithCopy - Includes copy-to-clipboard functionality
 */
export function DisplayNameWithCopy({ 
  address, 
  showAddress = true,
  className = ''
}: DisplayNameProps) {
  const { displayName } = useGetName(address);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // Could add toast notification here
    }
  };

  if (!address) return null;

  return (
    <button
      onClick={handleCopy}
      className={`${className} inline-flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors group`}
      title="Click to copy address"
    >
      <DisplayName address={address} showAddress={showAddress} />
      <svg
        className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </button>
  );
}

/**
 * DisplayNameBadge - Shows name in a badge style
 */
export function DisplayNameBadge({ 
  address, 
  className = 'bg-saffron-50 text-saffron-700 px-3 py-1 rounded-full text-sm'
}: DisplayNameProps) {
  const { displayName } = useGetName(address);

  if (!address) return null;

  return (
    <span className={className} title={address}>
      {displayName || formatAddress(address)}
    </span>
  );
}
