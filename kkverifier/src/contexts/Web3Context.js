'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { NETWORKS, APP_CONFIG, AUTHORIZED_ORGANIZERS } from '@/contracts/config'

const Web3Context = createContext()

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'organizer' | 'user' | null

  // Define handler functions before useEffect
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null)
      setSigner(null)
    } else {
      setAccount(accounts[0])
      // Refresh signer
      if (provider) {
        provider.getSigner().then(setSigner).catch(console.error)
      }
    }
  }

  const handleChainChanged = (chainId) => {
    // Reload the page when chain changes
    window.location.reload()
  }

  // Helper function to get MetaMask provider specifically
  const getMetaMaskProvider = () => {
    if (typeof window === 'undefined' || !window.ethereum) return null
    
    // Method 1: Check if there are multiple wallets via providers array
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      const metamask = window.ethereum.providers.find((provider) => provider.isMetaMask)
      if (metamask) return metamask
    }
    
    // Method 2: Check providerMap (alternative multi-wallet detection)
    if (window.ethereum.providerMap) {
      const metamask = window.ethereum.providerMap.get('MetaMask')
      if (metamask) return metamask
    }
    
    // Method 3: Direct access via window.ethereum (single wallet or MetaMask is primary)
    if (window.ethereum.isMetaMask) {
      return window.ethereum
    }
    
    // Method 4: Fallback - check if MetaMask is injected separately
    if (window.MetaMask) {
      return window.MetaMask
    }
    
    return null
  }

  // Check if wallet address is an authorized organizer
  const checkUserRole = (address) => {
    if (!address) return null
    
    // Convert address to lowercase for case-insensitive comparison
    const normalizedAddress = address.toLowerCase()
    
    // Check if address is in the authorized organizers list
    const isOrganizer = AUTHORIZED_ORGANIZERS.some(
      (orgAddress) => orgAddress.toLowerCase() === normalizedAddress
    )
    
    return isOrganizer ? 'organizer' : 'user'
  }

  // Initialize provider
  useEffect(() => {
    const metaMaskProvider = getMetaMaskProvider()
    
    if (metaMaskProvider) {
      const web3Provider = new ethers.providers.Web3Provider(metaMaskProvider)
      setProvider(web3Provider)

      // Listen for account changes
      metaMaskProvider.on('accountsChanged', handleAccountsChanged)
      metaMaskProvider.on('chainChanged', handleChainChanged)

      // Check if already connected
      checkIfConnected()
    }

    return () => {
      const metaMaskProvider = getMetaMaskProvider()
      if (metaMaskProvider) {
        metaMaskProvider.removeListener('accountsChanged', handleAccountsChanged)
        metaMaskProvider.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  async function checkIfConnected() {
    try {
      const metaMaskProvider = getMetaMaskProvider()
      if (metaMaskProvider) {
        const accounts = await metaMaskProvider.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const web3Provider = new ethers.providers.Web3Provider(metaMaskProvider)
          const web3Signer = web3Provider.getSigner()
          const network = await web3Provider.getNetwork()
          
          setAccount(accounts[0])
          setSigner(web3Signer)
          setChainId(network.chainId.toString())
          
          // Check and set user role
          const role = checkUserRole(accounts[0])
          setUserRole(role)
          console.log(`👤 User role: ${role}`)
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err)
    }
  }

  async function connectWallet() {
    // Get MetaMask provider specifically
    const metaMaskProvider = getMetaMaskProvider()
    
    // Debug logging
    console.log('🔍 Debug Info:')
    console.log('- window.ethereum exists:', !!window.ethereum)
    console.log('- window.ethereum.isMetaMask:', window.ethereum?.isMetaMask)
    console.log('- window.ethereum.providers:', window.ethereum?.providers)
    console.log('- window.ethereum.providerMap:', window.ethereum?.providerMap)
    console.log('- MetaMask provider found:', !!metaMaskProvider)
    
    // Check if MetaMask is installed
    if (!metaMaskProvider) {
      console.error('❌ MetaMask provider not found')
      setError('MetaMask is not installed. Please install MetaMask extension from https://metamask.io')
      // Open MetaMask download page
      if (typeof window !== 'undefined') {
        window.open('https://metamask.io/download/', '_blank')
      }
      return false
    }
    
    console.log('✅ MetaMask provider found, attempting connection...')

    setIsConnecting(true)
    setError(null)

    try {
      // Request account access from MetaMask specifically
      const accounts = await metaMaskProvider.request({
        method: 'eth_requestAccounts',
      })

      const web3Provider = new ethers.providers.Web3Provider(metaMaskProvider)
      const web3Signer = web3Provider.getSigner()
      const network = await web3Provider.getNetwork()

      setProvider(web3Provider)
      setSigner(web3Signer)
      setAccount(accounts[0])
      setChainId(network.chainId.toString())

      // Check and set user role
      const role = checkUserRole(accounts[0])
      setUserRole(role)
      console.log(`✅ Connected! User role: ${role}`)
      console.log(`📍 Address: ${accounts[0]}`)

      setIsConnecting(false)
      
      // Return role for redirect logic
      return { success: true, role }
    } catch (err) {
      console.error('Error connecting MetaMask:', err)
      if (err.code === 4001) {
        setError('MetaMask connection rejected by user')
      } else {
        setError(err.message || 'Failed to connect to MetaMask')
      }
      setIsConnecting(false)
      return { success: false, error: err.message }
    }
  }

  async function disconnectWallet() {
    setAccount(null)
    setSigner(null)
    setChainId(null)
    setUserRole(null)
  }

  async function switchNetwork(networkName) {
    const metaMaskProvider = getMetaMaskProvider()
    if (!metaMaskProvider) return false

    const network = NETWORKS[networkName]
    if (!network) return false

    try {
      await metaMaskProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      })
      return true
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await metaMaskProvider.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          })
          return true
        } catch (addError) {
          console.error('Error adding network:', addError)
          return false
        }
      }
      console.error('Error switching network:', switchError)
      return false
    }
  }

  const value = {
    provider,
    signer,
    account,
    chainId,
    isConnecting,
    error,
    isConnected: !!account,
    userRole,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}
