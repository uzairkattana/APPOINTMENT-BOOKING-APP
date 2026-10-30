import React from 'react'
import { cn } from '@/lib/utils'

interface CalendarIconProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'medical' | 'spine' | 'appointment'
  animated?: boolean
}

export const CalendarIcon: React.FC<CalendarIconProps> = ({
  className,
  size = 'md',
  variant = 'default',
  animated = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const baseClasses = cn(
    'relative',
    sizeClasses[size],
    animated && 'hover:scale-110 transition-transform duration-200',
    className
  )

  if (variant === 'medical') {
    return (
      <div className={baseClasses}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          {/* Calendar Base */}
          <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
          
          {/* Calendar Header */}
          <rect x="3" y="4" width="18" height="4" rx="2" fill="currentColor" fillOpacity="0.3"/>
          
          {/* Calendar Rings */}
          <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17" y1="2" x2="17" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Medical Cross */}
          <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Appointment Dots */}
          <circle cx="8" cy="12" r="1" fill="currentColor"/>
          <circle cx="16" cy="12" r="1" fill="currentColor"/>
          <circle cx="8" cy="16" r="1" fill="currentColor"/>
          <circle cx="16" cy="16" r="1" fill="currentColor"/>
          
          {animated && (
            <circle cx="12" cy="14" r="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5">
              <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
            </circle>
          )}
        </svg>
      </div>
    )
  }

  if (variant === 'spine') {
    return (
      <div className={baseClasses}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          {/* Calendar Base */}
          <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
          
          {/* Calendar Header */}
          <rect x="3" y="4" width="18" height="4" rx="2" fill="currentColor" fillOpacity="0.3"/>
          
          {/* Calendar Rings */}
          <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17" y1="2" x2="17" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Spine Representation */}
          <path d="M12 10 L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="12" cy="11" rx="1.5" ry="0.8" fill="currentColor"/>
          <ellipse cx="12" cy="13" rx="1.5" ry="0.8" fill="currentColor"/>
          <ellipse cx="12" cy="15" rx="1.5" ry="0.8" fill="currentColor"/>
          <ellipse cx="12" cy="17" rx="1.5" ry="0.8" fill="currentColor"/>
          
          {/* Chiropractic Alignment Lines */}
          <line x1="9" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <line x1="13" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <line x1="9" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <line x1="13" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          
          {animated && (
            <path d="M12 10 L12 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite"/>
            </path>
          )}
        </svg>
      </div>
    )
  }

  if (variant === 'appointment') {
    return (
      <div className={baseClasses}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          {/* Calendar Base */}
          <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
          
          {/* Calendar Header */}
          <rect x="3" y="4" width="18" height="4" rx="2" fill="currentColor" fillOpacity="0.3"/>
          
          {/* Calendar Rings */}
          <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17" y1="2" x2="17" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Appointment Time Slots */}
          <rect x="6" y="10" width="3" height="2" rx="1" fill="currentColor" fillOpacity="0.6"/>
          <rect x="10" y="10" width="3" height="2" rx="1" fill="currentColor" fillOpacity="0.4"/>
          <rect x="14" y="10" width="3" height="2" rx="1" fill="currentColor" fillOpacity="0.8"/>
          
          <rect x="6" y="13" width="3" height="2" rx="1" fill="currentColor" fillOpacity="0.3"/>
          <rect x="10" y="13" width="3" height="2" rx="1" fill="currentColor" fillOpacity="0.7"/>
          <rect x="14" y="13" width="3" height="2" rx="1" fill="currentColor" fillOpacity="0.5"/>
          
          <rect x="6" y="16" width="3" height="2" rx="1" fill="currentColor" fillOpacity="0.6"/>
          <rect x="10" y="16" width="3" height="2" rx="1" fill="currentColor" fillOpacity="0.4"/>
          <rect x="14" y="16" width="3" height="2" rx="1" fill="currentColor" fillOpacity="0.9"/>
          
          {/* Clock indicator */}
          <circle cx="18" cy="18" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1"/>
          <line x1="18" y1="16" x2="18" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <line x1="18" y1="18" x2="19" y2="19" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          
          {animated && (
            <circle cx="18" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5">
              <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
            </circle>
          )}
        </svg>
      </div>
    )
  }

  // Default variant
  return (
    <div className={baseClasses}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Calendar Base */}
        <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
        
        {/* Calendar Header */}
        <rect x="3" y="4" width="18" height="4" rx="2" fill="currentColor" fillOpacity="0.3"/>
        
        {/* Calendar Rings */}
        <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="17" y1="2" x2="17" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        
        {/* Grid Lines */}
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"/>
        <line x1="3" y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"/>
        <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"/>
        
        <line x1="9" y1="8" x2="9" y2="20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"/>
        <line x1="15" y1="8" x2="15" y2="20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"/>
        
        {/* Date indicator */}
        <circle cx="12" cy="14" r="2" fill="currentColor" fillOpacity="0.8"/>
        <text x="12" y="16" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">
          {new Date().getDate()}
        </text>
        
        {animated && (
          <circle cx="12" cy="14" r="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5">
            <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
          </circle>
        )}
      </svg>
    </div>
  )
}

export default CalendarIcon
