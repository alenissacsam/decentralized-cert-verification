'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  useListPublicTemplates, 
  useGetInstitutionTemplates,
  useGetTemplate 
} from '@/hooks/useContracts';
import { FiCheckCircle, FiImage, FiUsers, FiLock } from 'react-icons/fi';

interface TemplateSelectorProps {
  value: number | null;
  onChange: (templateId: number | null) => void;
  className?: string;
}

/**
 * TemplateCard - Individual template display
 */
function TemplateCard({ 
  templateId, 
  selected, 
  onClick 
}: { 
  templateId: number; 
  selected: boolean; 
  onClick: () => void;
}) {
  const { template, isLoading } = useGetTemplate(BigInt(templateId));

  if (isLoading) {
    return (
      <div className="border-2 border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-24 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div
      onClick={onClick}
      className={`
        border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg
        ${selected 
          ? 'border-saffron-500 bg-saffron-50 shadow-md' 
          : 'border-gray-200 hover:border-saffron-300'
        }
      `}
    >
      {/* Preview Image Placeholder */}
      <div className={`
        h-24 rounded-lg mb-3 flex items-center justify-center
        ${selected ? 'bg-saffron-100' : 'bg-gray-100'}
      `}>
        <FiImage className={`text-3xl ${selected ? 'text-saffron-600' : 'text-gray-400'}`} />
      </div>

      {/* Template Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            Template #{templateId}
          </h4>
          <p className="text-sm text-gray-600 capitalize">
            {template.category}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {template.isPublic ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <FiUsers className="text-xs" />
                Public
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                <FiLock className="text-xs" />
                Private
              </span>
            )}
            <span className="text-xs text-gray-500">
              Used {template.usageCount?.toString() || '0'}x
            </span>
          </div>
        </div>
        
        {/* Selection Indicator */}
        {selected && (
          <FiCheckCircle className="text-2xl text-saffron-600 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

/**
 * TemplateSelector - Main component for selecting certificate templates
 */
export function TemplateSelector({ 
  value, 
  onChange, 
  className = '' 
}: TemplateSelectorProps) {
  const { address } = useAccount();
  const [showType, setShowType] = useState<'public' | 'mine'>('public');
  
  const { templateIds: publicTemplateIds, isLoading: loadingPublic } = useListPublicTemplates();
  const { templateIds: myTemplateIds, isLoading: loadingMine } = useGetInstitutionTemplates(address);

  const templates = showType === 'public' ? publicTemplateIds : myTemplateIds;
  const isLoading = showType === 'public' ? loadingPublic : loadingMine;

  return (
    <div className={className}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Select Certificate Template
        </h3>
        
        {/* Public / My Templates Toggle */}
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setShowType('public')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${showType === 'public'
                ? 'bg-saffron-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <FiUsers className="inline mr-1" />
            Public
          </button>
          <button
            onClick={() => setShowType('mine')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${showType === 'mine'
                ? 'bg-saffron-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <FiLock className="inline mr-1" />
            My Templates
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* No Template Option */}
        <div
          onClick={() => onChange(null)}
          className={`
            border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg
            ${value === null
              ? 'border-saffron-500 bg-saffron-50 shadow-md'
              : 'border-gray-200 hover:border-saffron-300'
            }
          `}
        >
          <div className={`
            h-24 rounded-lg mb-3 flex items-center justify-center
            ${value === null ? 'bg-saffron-100' : 'bg-gray-100'}
          `}>
            <div className="text-center">
              <div className="text-2xl mb-1">📄</div>
              <div className="text-sm text-gray-600">Plain Certificate</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">No Template</h4>
              <p className="text-sm text-gray-600">Basic certificate</p>
            </div>
            {value === null && (
              <FiCheckCircle className="text-2xl text-saffron-600" />
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-24 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </>
        )}

        {/* Template Cards */}
        {!isLoading && templates && templates.length > 0 ? (
          templates.map((templateId) => (
            <TemplateCard
              key={templateId.toString()}
              templateId={Number(templateId)}
              selected={value === Number(templateId)}
              onClick={() => onChange(Number(templateId))}
            />
          ))
        ) : !isLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <FiImage className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No {showType === 'mine' ? 'private' : 'public'} templates available</p>
            {showType === 'mine' && (
              <p className="text-sm mt-1">
                Create your first template in the Templates page
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Selected Template Info */}
      {value !== null && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Template #{value} selected. Certificate will use this template design.
          </p>
        </div>
      )}
    </div>
  );
}
