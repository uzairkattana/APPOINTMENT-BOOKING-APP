"use client"

// Mobile-specific styles for chat interface
export const mobileChatStyles = `
  /* Mobile viewport handling for keyboard */
  @supports (-webkit-touch-callout: none) {
    /* iOS Safari specific */
    .mobile-chat-container {
      height: 100vh;
      height: -webkit-fill-available;
    }
  }

  /* Prevent zoom on input focus (iOS Safari) */
  @supports (-webkit-touch-callout: none) {
    .mobile-chat-input {
      font-size: 16px !important;
      transform-origin: left top;
      transform: scale(0.875);
    }
  }

  /* Android keyboard handling */
  @media screen and (max-width: 768px) {
    .mobile-chat-messages {
      height: calc(100vh - 120px);
      overflow-y: auto;
    }
    
    .mobile-chat-header {
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .mobile-chat-input {
      position: sticky;
      bottom: 0;
      z-index: 40;
    }
  }

  /* Visual Viewport API support */
  @supports (height: 100dvh) {
    .mobile-chat-container {
      height: 100dvh;
    }
    
    .mobile-chat-messages {
      height: calc(100dvh - 120px);
    }
  }

  /* Prevent body scroll when chat is open on mobile */
  body.mobile-chat-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }

  /* Safe area handling for notched phones */
  .mobile-chat-container {
    padding-top: env(safe-area-inset-top, 0);
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  /* Keyboard animation smooth transition */
  .mobile-chat-messages {
    transition: height 0.3s ease-out;
  }

  /* Input field focus styles */
  .mobile-chat-input:focus-within {
    background: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }

  /* Hide scrollbars on mobile */
  .mobile-chat-messages::-webkit-scrollbar {
    display: none;
  }
  
  .mobile-chat-messages {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

export const applyMobileStyles = () => {
  if (typeof window !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = mobileChatStyles
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }
  return () => {}
}
