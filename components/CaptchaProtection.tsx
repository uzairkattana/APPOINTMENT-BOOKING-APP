"use client"

import { useState, useEffect } from 'react'

interface CaptchaProtectionProps {
  onVerified: () => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

export default function CaptchaProtection({ onVerified, difficulty = 'medium' }: CaptchaProtectionProps) {
  const [challenge, setChallenge] = useState({ question: '', answer: 0 })
  const [userAnswer, setUserAnswer] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)

  const generateChallenge = () => {
    const challenges = {
      easy: [
        () => {
          const a = Math.floor(Math.random() * 10) + 1
          const b = Math.floor(Math.random() * 10) + 1
          return { question: `What is ${a} + ${b}?`, answer: a + b }
        },
        () => {
          const a = Math.floor(Math.random() * 20) + 1
          const b = Math.floor(Math.random() * 10) + 1
          return { question: `What is ${a} - ${b}?`, answer: a - b }
        }
      ],
      medium: [
        () => {
          const a = Math.floor(Math.random() * 10) + 1
          const b = Math.floor(Math.random() * 10) + 1
          return { question: `What is ${a} × ${b}?`, answer: a * b }
        },
        () => {
          const colors = ['red', 'blue', 'green', 'yellow', 'purple']
          const color = colors[Math.floor(Math.random() * colors.length)]
          const count = Math.floor(Math.random() * 5) + 3
          return { 
            question: `How many letters are in the word "${color}"?`, 
            answer: color.length 
          }
        },
        () => {
          const year = new Date().getFullYear()
          return { 
            question: `What year is it now? (4 digits)`, 
            answer: year 
          }
        }
      ],
      hard: [
        () => {
          const a = Math.floor(Math.random() * 15) + 5
          const b = Math.floor(Math.random() * 8) + 2
          return { question: `What is ${a} ÷ ${b}? (rounded down)`, answer: Math.floor(a / b) }
        },
        () => {
          const sequence = [2, 4, 6, 8]
          const next = sequence[sequence.length - 1] + 2
          return { 
            question: `What's the next number in this sequence: ${sequence.join(', ')}, ?`, 
            answer: next 
          }
        }
      ]
    }

    const difficultyOptions = challenges[difficulty]
    const selectedChallenge = difficultyOptions[Math.floor(Math.random() * difficultyOptions.length)]()
    setChallenge(selectedChallenge)
  }

  useEffect(() => {
    generateChallenge()
  }, [difficulty])

  const handleSubmit = () => {
    const numericAnswer = parseInt(userAnswer.trim())
    
    if (numericAnswer === challenge.answer) {
      // Successful verification
      localStorage.setItem('captcha_verified', Date.now().toString())
      onVerified()
    } else {
      setAttempts(prev => prev + 1)
      setUserAnswer('')
      
      if (attempts >= 2) {
        setIsBlocked(true)
        // Block for 5 minutes
        setTimeout(() => {
          setIsBlocked(false)
          setAttempts(0)
        }, 300000)
      } else {
        generateChallenge()
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (isBlocked) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '48px', color: '#e74c3c', marginBottom: '20px' }}>🚫</div>
          <h2 style={{ color: '#e74c3c', marginBottom: '16px' }}>Access Temporarily Blocked</h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Too many failed attempts. Please wait 5 minutes before trying again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
        <h2 style={{ color: '#333', marginBottom: '16px' }}>Human Verification Required</h2>
        <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
          We've detected unusual activity. Please solve this challenge to continue.
        </p>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #0d5c75'
        }}>
          <h3 style={{ color: '#0d5c75', marginBottom: '12px', fontSize: '18px' }}>
            {challenge.question}
          </h3>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your answer"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              textAlign: 'center',
              outline: 'none',
              marginBottom: '16px'
            }}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            style={{
              backgroundColor: userAnswer.trim() ? '#0d5c75' : '#ccc',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            Verify
          </button>
        </div>

        {attempts > 0 && (
          <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '12px' }}>
            Incorrect answer. Attempts remaining: {3 - attempts}
          </p>
        )}

        <p style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
          This verification helps protect our website from automated access.
        </p>
      </div>
    </div>
  )
}

// Hook to check if CAPTCHA verification is needed
export function useCaptchaProtection() {
  const [needsCaptcha, setNeedsCaptcha] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Check if user has been verified recently
    const lastVerified = localStorage.getItem('captcha_verified')
    const now = Date.now()
    const verificationWindow = 3600000 // 1 hour

    if (lastVerified && (now - parseInt(lastVerified)) < verificationWindow) {
      setIsVerified(true)
      return
    }

    // Check for suspicious patterns that trigger CAPTCHA
    const checkSuspiciousActivity = () => {
      // Check for rapid page loads
      const pageLoadTimes = JSON.parse(localStorage.getItem('page_loads') || '[]')
      const currentTime = now
      
      // Add current load time
      pageLoadTimes.push(currentTime)
      
      // Keep only last 10 loads
      const recentLoads = pageLoadTimes.slice(-10)
      localStorage.setItem('page_loads', JSON.stringify(recentLoads))
      
      // Check if too many loads in short time
      if (recentLoads.length >= 5) {
        const timeDiff = recentLoads[recentLoads.length - 1] - recentLoads[0]
        if (timeDiff < 10000) { // 5 loads in less than 10 seconds
          setNeedsCaptcha(true)
          return
        }
      }

      // Check user agent for suspicious patterns
      const userAgent = navigator.userAgent.toLowerCase()
      const suspiciousAgents = ['headless', 'automation', 'selenium', 'phantom']
      
      if (suspiciousAgents.some(agent => userAgent.includes(agent))) {
        setNeedsCaptcha(true)
        return
      }

      // Random verification (1% chance)
      if (Math.random() < 0.01) {
        setNeedsCaptcha(true)
        return
      }

      setIsVerified(true)
    }

    checkSuspiciousActivity()
  }, [])

  const handleVerified = () => {
    setNeedsCaptcha(false)
    setIsVerified(true)
  }

  return { needsCaptcha, isVerified, handleVerified }
}