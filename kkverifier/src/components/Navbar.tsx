'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { FiMenu, FiX, FiHome, FiAward, FiCheck, FiUsers, FiUser } from 'react-icons/fi'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Tricolor Top Bar */}
      <div className="h-1 bg-tricolor-gradient"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-saffron to-green text-white p-2 rounded-lg">
                <FiAward className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-saffron via-navy to-green bg-clip-text text-transparent">
                  KK Verifier
                </span>
                <div className="text-xs text-gray-500 -mt-1">Blockchain Certificates</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-saffron flex items-center space-x-2 transition font-semibold"
            >
              <FiHome className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              href="/verify"
              className="text-gray-600 hover:text-green flex items-center space-x-2 transition font-semibold"
            >
              <FiCheck className="w-4 h-4" />
              <span>Verify</span>
            </Link>

            <Link
              href="/issue"
              className="text-gray-600 hover:text-saffron flex items-center space-x-2 transition font-semibold"
            >
              <FiUsers className="w-4 h-4" />
              <span>Issue</span>
            </Link>

            <Link
              href="/templates"
              className="text-gray-600 hover:text-saffron flex items-center space-x-2 transition font-semibold"
            >
              <FiAward className="w-4 h-4" />
              <span>Templates</span>
            </Link>

            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-green flex items-center space-x-2 transition font-semibold"
            >
              <FiUser className="w-4 h-4" />
              <span>My Certificates</span>
            </Link>

            {/* RainbowKit ConnectButton */}
            <ConnectButton chainStatus="icon" showBalance={false} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-saffron p-2"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2">
            <div className="flex flex-col space-y-3 pt-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-saffron flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiHome className="w-5 h-5" />
                <span className="font-semibold">Home</span>
              </Link>
              
              <Link
                href="/verify"
                className="text-gray-600 hover:text-green flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiCheck className="w-5 h-5" />
                <span className="font-semibold">Verify</span>
              </Link>

              <Link
                href="/issue"
                className="text-gray-600 hover:text-saffron flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUsers className="w-5 h-5" />
                <span className="font-semibold">Issue</span>
              </Link>

              <Link
                href="/templates"
                className="text-gray-600 hover:text-saffron flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiAward className="w-5 h-5" />
                <span className="font-semibold">Templates</span>
              </Link>

              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-green flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUser className="w-5 h-5" />
                <span className="font-semibold">My Certificates</span>
              </Link>

              <div className="pt-2">
                <ConnectButton chainStatus="full" showBalance={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
