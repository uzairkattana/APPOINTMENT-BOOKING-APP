"use client"

import { useEffect } from 'react'

export default function AntiScraping() {
  useEffect(() => {
    // Detect if user is on mobile device
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0)

    // Detect if running in a tablet
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent)

    // Skip aggressive checks on mobile devices to prevent false positives
    if (isMobile || isTablet) {
      console.log('Mobile device detected - using limited anti-scraping measures')
      // Only show console warning on mobile, no other restrictions
      console.log('%cSTOP!', 'color: red; font-size: 30px; font-weight: bold;')
      console.log('%cThis is a browser feature intended for developers.', 'color: red; font-size: 12px;')
      return () => {} // Early return with empty cleanup
    }

    // Desktop-only anti-scraping measures
    // 1. Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // 2. Disable common keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }
      
      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        return false
      }
      
      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        return false
      }
      
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        return false
      }
      
      // Disable Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        return false
      }
      
      // Disable Ctrl+A (Select All)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        return false
      }
      
      // Disable Ctrl+C (Copy)
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault()
        return false
      }
      
      // Disable Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault()
        return false
      }
    }

    // 3. Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // 4. Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // 5. Detect developer tools (DISABLED - causes issues on mobile)
    // This check is now disabled as it causes false positives
    const checkDevTools = () => {
      // Disabled to prevent mobile browser issues
      return
    }

    // 6. Detect automation tools (only on desktop)
    const detectAutomation = () => {
      // Check for webdriver
      if ((window as any).webdriver || (navigator as any).webdriver) {
        console.warn('Automation detected')
        // Just log warning instead of blocking - less disruptive
        return
      }
      
      // Check for Selenium
      if ((window as any)._selenium || (document as any).$cdc_asdjflasutopfhvcZLmcfl_) {
        console.warn('Selenium detected')
        return
      }
      
      // Check for PhantomJS
      if ((window as any).callPhantom || (window as any)._phantom) {
        console.warn('PhantomJS detected')
        return
      }
    }

    // 7. Monitor console access (desktop only)
    let consoleWarningShown = false
    const showConsoleWarning = () => {
      if (!consoleWarningShown) {
        consoleWarningShown = true
        console.clear()
        console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;')
        console.log('%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable a feature or "hack" someone\'s account, it is a scam and will give them access to your information.', 'color: red; font-size: 14px;')
      }
    }

    // 8. Obfuscate content periodically (DISABLED - too disruptive)
    const obfuscateContent = () => {
      // Disabled to prevent interfering with normal website use
      return
    }

    // 9. Detect rapid page access patterns (DISABLED - causes issues on mobile)
    const trackPageAccess = () => {
      // Disabled to prevent false positives on mobile devices
      return
    }

    // Add event listeners (desktop only)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('dragstart', handleDragStart)

    // Initial checks (minimal to avoid false positives)
    showConsoleWarning()

    // Periodic checks (disabled aggressive checks)
    // const devToolsInterval = setInterval(checkDevTools, 1000) // DISABLED
    // const obfuscateInterval = setInterval(obfuscateContent, 30000) // DISABLED
    const automationInterval = setInterval(detectAutomation, 10000) // Reduced frequency

    // 10. Monitor for suspicious DOM access patterns (with higher threshold)
    let domAccessCount = 0
    const originalQuerySelector = document.querySelector
    const originalQuerySelectorAll = document.querySelectorAll
    
    // Reset DOM access count every minute to prevent false positives
    setInterval(() => {
      domAccessCount = 0
    }, 60000)
    
    document.querySelector = function(...args) {
      domAccessCount++
      if (domAccessCount > 200) { // Increased threshold for legitimate use
        console.warn('Excessive DOM queries detected:', domAccessCount)
        // Log but don't block - just warn
      }
      return originalQuerySelector.apply(this, args)
    }
    
    document.querySelectorAll = function(...args) {
      domAccessCount++
      if (domAccessCount > 200) {
        console.warn('Excessive DOM queries detected:', domAccessCount)
        // Log but don't block - just warn  
      }
      return originalQuerySelectorAll.apply(this, args)
    }

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('dragstart', handleDragStart)
      // clearInterval(devToolsInterval) // Already disabled
      // clearInterval(obfuscateInterval) // Already disabled
      clearInterval(automationInterval)
    }
  }, [])

  return null // This component doesn't render anything
}