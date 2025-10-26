'use client'

import Link from 'next/link'
import { useWeb3 } from '@/contexts/Web3Context'
import { FiAward, FiCheck, FiShield, FiZap, FiArrowRight, FiGlobe, FiX } from 'react-icons/fi'

export default function Home() {
  const { isConnected, connectWallet } = useWeb3()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-secondary text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🚨 10,000+ Fake Certificates Found Yearly
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Stop Certificate Fraud
              <br />
              <span className="text-accent">With Blockchain Verification</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Instant, tamper-proof certificate verification for hackathons, colleges, and courses.
              Verify in 2 seconds, not 7 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center space-x-2"
                  >
                    <span>Go to Dashboard</span>
                    <FiArrowRight />
                  </Link>
                  <Link
                    href="/issue"
                    className="bg-accent text-dark px-8 py-4 rounded-lg font-semibold hover:bg-yellow-500 transition inline-flex items-center justify-center space-x-2"
                  >
                    <FiAward />
                    <span>Issue Certificate</span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={connectWallet}
                    className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center space-x-2"
                  >
                    <span>Connect Wallet</span>
                    <FiArrowRight />
                  </button>
                  <Link
                    href="/verify"
                    className="bg-accent text-dark px-8 py-4 rounded-lg font-semibold hover:bg-yellow-500 transition inline-flex items-center justify-center space-x-2"
                  >
                    <FiCheck />
                    <span>Verify Certificate</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-dark mb-4">The Certificate Fraud Crisis</h2>
            <p className="text-xl text-gray-700">
              Traditional certificates are easily forged and expensive to verify
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-red-500">
              <div className="text-4xl font-bold text-red-600 mb-2">60%+</div>
              <p className="text-gray-700 font-medium">Of certificates can be easily forged</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-orange-500">
              <div className="text-4xl font-bold text-orange-600 mb-2">5-7 Days</div>
              <p className="text-gray-700 font-medium">To manually verify one certificate</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-yellow-500">
              <div className="text-4xl font-bold text-yellow-600 mb-2">$$$</div>
              <p className="text-gray-700 font-medium">High verification costs for employers</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-purple-500">
              <div className="text-4xl font-bold text-purple-600 mb-2">Zero</div>
              <p className="text-gray-700 font-medium">Real-time tamper-proof verification</p>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-dark mb-6 text-center">
              Traditional Certificate Problems
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <FiX className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Easy to Forge</h4>
                  <p className="text-gray-600 text-sm">
                    PDF/Paper certificates can be edited with basic tools like Photoshop
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FiX className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Slow Verification</h4>
                  <p className="text-gray-600 text-sm">
                    Manual verification takes days or weeks through email communication
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FiX className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Centralized Risk</h4>
                  <p className="text-gray-600 text-sm">
                    Central databases can be hacked, modified, or corrupted
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FiX className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">No Proof of Authenticity</h4>
                  <p className="text-gray-600 text-sm">
                    Relies solely on trust - no cryptographic proof of validity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark mb-4">How Blockchain Solves This</h2>
            <p className="text-xl text-gray-600">
              Cryptographically secure, instant verification with zero possibility of fraud
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-blue-50 hover:shadow-lg transition">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">100% Tamper-Proof</h3>
              <p className="text-gray-600 mb-4">
                Certificates stored on blockchain with cryptographic hashing. Changing even one
                character completely breaks the verification.
              </p>
              <div className="bg-white rounded-lg p-4 text-left">
                <p className="text-xs font-mono text-gray-500 mb-2">Certificate Hash:</p>
                <p className="text-xs font-mono text-primary break-all">
                  a3f9d8e2c1b7a6f5e4d3c2b1a9f8e7d6
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ Permanently recorded on blockchain
                </p>
              </div>
            </div>

            <div className="text-center p-8 rounded-xl bg-green-50 hover:shadow-lg transition">
              <div className="bg-secondary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiZap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">2-Second Verification</h3>
              <p className="text-gray-600 mb-4">
                Scan QR code or enter certificate ID for instant blockchain verification. No
                emails, no waiting, no manual checks.
              </p>
              <div className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Traditional:</span>
                  <span className="text-red-600 font-bold">5-7 days ⏰</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Blockchain:</span>
                  <span className="text-green-600 font-bold">2 seconds ⚡</span>
                </div>
              </div>
            </div>

            <div className="text-center p-8 rounded-xl bg-purple-50 hover:shadow-lg transition">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiGlobe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Publicly Verifiable</h3>
              <p className="text-gray-600 mb-4">
                Anyone can verify certificates without login. Complete transparency with
                blockchain explorer integration for ultimate trust.
              </p>
              <div className="bg-white rounded-lg p-4">
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">No account required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Works on any device</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">View on blockchain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">
              Three simple steps to tamper-proof certificate verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Issue Certificate</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Hackathon organizer creates certificate with winner details</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>System generates unique cryptographic hash (certificate DNA)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Hash permanently recorded on blockchain - can never be altered</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>QR code generated for instant verification</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-primary mb-2">Blockchain Record:</p>
                <p className="text-xs font-mono text-gray-600 break-all">
                  Block #12345
                  <br />
                  Hash: a3f9d8e2...
                  <br />
                  ✓ Permanent & Immutable
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Receive & Share</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Winner receives professional PDF certificate with embedded QR</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Certificate visible in personal dashboard instantly</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Easy sharing on LinkedIn, Twitter, email, or direct link</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Download anytime in multiple formats (PDF, PNG, JSON)</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <div className="bg-gray-100 p-4 rounded-lg inline-block">
                  <div className="w-24 h-24 bg-white border-4 border-primary rounded-lg flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-600">Scan to Verify</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Instant Verification</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Recruiter scans QR or clicks verification link - no login needed</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>System queries blockchain to check certificate authenticity</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Results displayed in 2 seconds with complete details</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>View blockchain proof via explorer for 100% transparency</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-bold text-green-800 mb-1">✓ VERIFIED</p>
                <p className="text-xs text-gray-600">
                  Authentic certificate
                  <br />
                  Issued by verified organization
                  <br />
                  Not revoked or tampered
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Why This Can't Be Faked</h3>
            <p className="text-lg mb-6 max-w-3xl mx-auto">
              Even changing a single character in the certificate completely changes its
              cryptographic hash, making verification fail instantly. The blockchain record is
              permanent and distributed across thousands of nodes - impossible to hack or modify.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl mb-2">🔐</div>
                <p className="font-semibold">Cryptographic Security</p>
                <p className="text-sm mt-1 opacity-90">SHA-256 hashing</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl mb-2">⛓️</div>
                <p className="font-semibold">Distributed Ledger</p>
                <p className="text-sm mt-1 opacity-90">Thousands of nodes</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl mb-2">🚫</div>
                <p className="font-semibold">Zero Fraud Risk</p>
                <p className="text-sm mt-1 opacity-90">Mathematically impossible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join thousands of institutions using blockchain for certificate management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isConnected ? (
              <Link
                href="/issue"
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center space-x-2"
              >
                <FiAward />
                <span>Issue Your First Certificate</span>
              </Link>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center space-x-2"
              >
                <span>Connect Wallet to Start</span>
                <FiArrowRight />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
