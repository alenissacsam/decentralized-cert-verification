'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useWeb3 } from './Web3Context'
import {
  CertificateSDK,
  OrganizationSDK,
  UserIdentitySDK,
  BadgeSDK,
} from '@/contracts/contractsSdk'

const ContractContext = createContext()

export function ContractProvider({ children }) {
  const { provider, account } = useWeb3()
  const [certificateSDK, setCertificateSDK] = useState(null)
  const [organizationSDK, setOrganizationSDK] = useState(null)
  const [userIdentitySDK, setUserIdentitySDK] = useState(null)
  const [badgeSDK, setBadgeSDK] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize SDKs when provider is available
  useEffect(() => {
    if (provider) {
      const network = process.env.NEXT_PUBLIC_NETWORK_NAME || 'sepolia'
      
      setCertificateSDK(new CertificateSDK(provider, network))
      setOrganizationSDK(new OrganizationSDK(provider, network))
      setUserIdentitySDK(new UserIdentitySDK(provider, network))
      setBadgeSDK(new BadgeSDK(provider, network))
    }
  }, [provider])

  const value = {
    certificateSDK,
    organizationSDK,
    userIdentitySDK,
    badgeSDK,
    isLoading,
    setIsLoading,
  }

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContracts() {
  const context = useContext(ContractContext)
  if (!context) {
    throw new Error('useContracts must be used within a ContractProvider')
  }
  return context
}
