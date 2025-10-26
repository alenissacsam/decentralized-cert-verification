'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWeb3 } from '@/contexts/Web3Context'
import { formatAddress } from '@/utils/helpers'
import { FiMenu, FiX, FiHome, FiAward, FiCheck, FiUser, FiLogOut, FiLogIn } from 'react-icons/fi'

export default function Navbar() {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary text-white p-2 rounded-lg">
                <FiAward className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-dark">KK Verifier</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary flex items-center space-x-1 transition"
            >
              <FiHome className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              href="/verify"
              className="text-gray-600 hover:text-primary flex items-center space-x-1 transition"
            >
              <FiCheck className="w-4 h-4" />
              <span>Verify</span>
            </Link>

            {isConnected && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-primary flex items-center space-x-1 transition"
                >
                  <FiUser className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/issue"
                  className="text-gray-600 hover:text-primary flex items-center space-x-1 transition"
                >
                  <FiAward className="w-4 h-4" />
                  <span>Issue</span>
                </Link>
              </>
            )}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                  {formatAddress(account)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition font-medium"
              >
                <FiLogIn className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-600 hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/verify"
              className="block text-gray-600 hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Verify Certificate
            </Link>
            
            {isConnected && (
              <>
                <Link
                  href="/dashboard"
                  className="block text-gray-600 hover:text-primary py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/issue"
                  className="block text-gray-600 hover:text-primary py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Issue Certificate
                </Link>
              </>
            )}

            <div className="pt-4 border-t">
              {isConnected ? (
                <>
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium mb-2">
                    {formatAddress(account)}
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet()
                      setIsMenuOpen(false)
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    connectWallet()
                    setIsMenuOpen(false)
                  }}
                  className="w-full bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
