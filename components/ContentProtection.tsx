"use client"

import { useEffect, useState } from 'react'

interface ContentProtectionProps {
  children: React.ReactNode
  level?: 'low' | 'medium' | 'high'
}

export default function ContentProtection({ children, level = 'medium' }: ContentProtectionProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    // 1. Verify human interaction
    const verifyHuman = () => {
      // Check for mouse movement
      let mouseMovements = 0
      const handleMouseMove = () => {
        mouseMovements++
        if (mouseMovements > 5) {
          setIsVerified(true)
          document.removeEventListener('mousemove', handleMouseMove)
        }
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      
      // Auto-verify after timeout (in case user doesn't move mouse)
      setTimeout(() => {
        setIsVerified(true)
        document.removeEventListener('mousemove', handleMouseMove)
      }, 3000)
    }

    // 2. Detect headless browsers
    const detectHeadless = () => {
      // Check for common headless browser indicators
      const headlessIndicators = [
        () => window.outerHeight === 0,
        () => window.outerWidth === 0,
        () => !window.navigator.webdriver === undefined,
        () => window.navigator.languages === undefined,
        () => window.navigator.language === undefined,
        () => window.screen.width === 0,
        () => window.screen.height === 0,
        () => window.screen.colorDepth === undefined,
        () => document.documentElement.webdriver !== undefined,
        () => window.chrome === undefined && window.navigator.userAgent.includes('Chrome')
      ]

      const suspiciousCount = headlessIndicators.filter(indicator => {
        try {
          return indicator()
        } catch {
          return false
        }
      }).length

      if (suspiciousCount > 2) {
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0;font-family:Arial,sans-serif;"><div style="text-align:center;"><h1 style="color:#e74c3c;">Access Denied</h1><p>Headless browser detected.</p></div></div>'
        return false
      }
      return true
    }

    // 3. Content integrity check
    const integrityCheck = () => {
      const startTime = performance.now()
      // Perform heavy computation to detect automation
      let result = 0
      for (let i = 0; i < 100000; i++) {
        result += Math.random()
      }
      const endTime = performance.now()
      
      // If computation is too fast, likely automated
      if (endTime - startTime < 1) {
        setAttempts(prev => prev + 1)
        if (attempts > 3) {
          document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0;font-family:Arial,sans-serif;"><div style="text-align:center;"><h1 style="color:#e74c3c;">Suspicious Activity</h1><p>Automated access pattern detected.</p></div></div>'
        }
      }
    }

    if (detectHeadless()) {
      verifyHuman()
      integrityCheck()
    }

    // 4. Periodic content validation
    const validateContent = () => {
      // Check if content has been tampered with
      const scripts = document.querySelectorAll('script[src]')
      scripts.forEach(script => {
        if (!script.src.includes(window.location.hostname) && 
            !script.src.includes('googleapis.com') && 
            !script.src.includes('gstatic.com')) {
          console.warn('Unauthorized script detected:', script.src)
          script.remove()
        }
      })
    }

    const validationInterval = setInterval(validateContent, 5000)

    return () => {
      clearInterval(validationInterval)
    }
  }, [attempts])

  // Render content based on protection level
  if (!isVerified && level === 'high') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        background: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            animation: 'spin 1s linear infinite',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #0d5c75',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }}></div>
          <p>Verifying human interaction...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return <>{children}</>
}

// High-security wrapper for sensitive content
export function SecureContent({ children }: { children: React.ReactNode }) {
  const [isSecure, setIsSecure] = useState(false)
  
  useEffect(() => {
    // Additional security checks for sensitive content
    const checkSecurity = () => {
      // Verify page wasn't loaded via automation
      const loadTime = performance.now()
      if (loadTime < 100) { // Page loaded too quickly
        return false
      }
      
      // Check for legitimate referrer
      const referrer = document.referrer
      if (referrer && !referrer.includes(window.location.hostname)) {
        // External referrer - additional verification needed
        return false
      }
      
      return true
    }
    
    setTimeout(() => {
      if (checkSecurity()) {
        setIsSecure(true)
      }
    }, 1000) // Delay to ensure proper loading
  }, [])
  
  if (!isSecure) {
    return (
      <div style={{
        background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center' as const,
        color: '#6c757d'
      }}>
        <p>🔒 Loading secure content...</p>
      </div>
    )
  }
  
  return <>{children}</>
}