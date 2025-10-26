'use client'

import Link from 'next/link'
import { FiAward, FiUsers, FiUser, FiShield, FiCheckCircle, FiLock } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10 relative overflow-hidden">
      {/* Animated Background Elements - Indian Cultural Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Ashoka Chakras */}
        <div className="absolute top-20 right-10 w-32 h-32 opacity-10 animate-chakra">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#000080" strokeWidth="2"/>
            {[...Array(24)].map((_, i) => (
              <line 
                key={i}
                x1="50" 
                y1="50" 
                x2="50" 
                y2="10" 
                stroke="#000080" 
                strokeWidth="1"
                transform={`rotate(${i * 15} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="8" fill="#000080"/>
          </svg>
        </div>
        
        <div className="absolute bottom-40 left-10 w-24 h-24 opacity-10 animate-chakra" style={{ animationDirection: 'reverse', animationDuration: '40s' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#FF9933" strokeWidth="2"/>
            {[...Array(24)].map((_, i) => (
              <line 
                key={i}
                x1="50" 
                y1="50" 
                x2="50" 
                y2="10" 
                stroke="#FF9933" 
                strokeWidth="1"
                transform={`rotate(${i * 15} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="8" fill="#FF9933"/>
          </svg>
        </div>

        {/* Decorative Indian Pattern Circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-saffron/5 to-transparent rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-green/5 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-navy/5 to-transparent rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Tricolor Particles */}
        <div className="absolute top-10 left-1/4 w-2 h-2 bg-saffron rounded-full opacity-40 animate-float"></div>
        <div className="absolute top-40 right-1/3 w-2 h-2 bg-green rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-navy rounded-full opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section with Indian Flag Accent */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-saffron via-white to-green animate-gradient-shift"></div>
        
        <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
          {/* Main Heading with Animation */}
          <div className="text-center max-w-4xl mx-auto mb-16 animate-slide-in-up">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white rounded-full shadow-lg border-2 border-saffron hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow">
              <FiAward className="text-3xl text-saffron animate-float" />
              <span className="text-2xl font-bold bg-gradient-to-r from-saffron via-navy to-green bg-clip-text text-transparent">
                KK Verifier
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Blockchain Certificate
              <span className="block bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent animate-gradient-shift">
                Verification System
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Secure, instant, and tamper-proof certificate verification powered by blockchain technology
            </p>
          </div>

          {/* Key Benefits - 3D Enhanced Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-saffron card-3d animate-slide-in-up hover:shadow-2xl transition-all duration-300" style={{ animationDelay: '0.1s' }}>
              <div className="bg-saffron/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-6">
                <FiShield className="text-3xl text-saffron" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">100% Secure</h3>
              <p className="text-sm text-gray-600">Blockchain-backed authenticity</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green card-3d animate-slide-in-up hover:shadow-2xl transition-all duration-300" style={{ animationDelay: '0.2s' }}>
              <div className="bg-green/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-6">
                <FiCheckCircle className="text-3xl text-green" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Instant Verify</h3>
              <p className="text-sm text-gray-600">Real-time verification in seconds</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-navy card-3d animate-slide-in-up hover:shadow-2xl transition-all duration-300" style={{ animationDelay: '0.3s' }}>
              <div className="bg-navy/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-6">
                <FiLock className="text-3xl text-navy" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Zero Fraud</h3>
              <p className="text-sm text-gray-600">Impossible to forge or tamper</p>
            </div>
          </div>

          {/* Role Selection - 3D Enhanced CTAs */}
          <div className="max-w-4xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Choose Your Role
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Organizer Card - 3D Enhanced */}
              <Link href="/organizer" className="group perspective-card">
                <div className="relative bg-gradient-to-br from-saffron via-saffron to-saffronDark p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2 text-white overflow-hidden">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl animate-float-slow"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 backdrop-blur-sm">
                      <FiUsers className="text-4xl transform group-hover:scale-110 transition-transform" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 group-hover:translate-x-1 transition-transform">
                      I'm an Organizer
                    </h3>
                    
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 transform group-hover:translate-x-2 transition-transform duration-300">
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>Choose certificate templates</span>
                      </li>
                      <li className="flex items-center gap-2 transform group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>Issue certificates (single/batch)</span>
                      </li>
                      <li className="flex items-center gap-2 transform group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>Manage & revoke certificates</span>
                      </li>
                    </ul>
                    
                    <div className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg group-hover:bg-white/20">
                      <span>Go to Organizer Dashboard</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </Link>

              {/* User Card - 3D Enhanced */}
              <Link href="/user" className="group perspective-card">
                <div className="relative bg-gradient-to-br from-green via-green to-greenDark p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2 text-white overflow-hidden">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float-slow"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl animate-float"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 backdrop-blur-sm">
                      <FiUser className="text-4xl transform group-hover:scale-110 transition-transform" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 group-hover:translate-x-1 transition-transform">
                      I'm a User
                    </h3>
                    
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 transform group-hover:translate-x-2 transition-transform duration-300">
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>View my certificates</span>
                      </li>
                      <li className="flex items-center gap-2 transform group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>Download & share certificates</span>
                      </li>
                      <li className="flex items-center gap-2 transform group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                        <FiCheckCircle className="flex-shrink-0" />
                        <span>Access my dashboard</span>
                      </li>
                    </ul>
                    
                    <div className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg group-hover:bg-white/20">
                      <span>Go to My Dashboard</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </Link>
            </div>
          </div>

          {/* Public Verification Link */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Want to verify a certificate?</p>
            <Link 
              href="/verify" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-navy text-white rounded-lg hover:bg-navy/90 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <FiShield className="text-xl" />
              <span>Verify Certificate</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Flag Accent */}
      <div className="h-2 bg-tricolor-gradient"></div>
    </div>
  )
}
