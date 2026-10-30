"use client"

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorProps {
  data: string
  size?: number
  logo?: string
  className?: string
}

export function QRCodeGenerator({ 
  data, 
  size = 200, 
  logo,
  className = '' 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [data, size, logo])

  const generateQRCode = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Generate high-quality QR code with optimal settings for scanning
      await QRCode.toCanvas(canvas, data, {
        width: size,
        margin: 2,  // Slightly larger margin for better scanning
        color: {
          dark: '#000000',  // Pure black for maximum contrast and scannability
          light: '#FFFFFF'  // Pure white background
        },
        errorCorrectionLevel: 'H'  // Highest error correction for reliability
      })

      // Add logo overlay in center if provided
      if (logo) {
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const logoSize = size * 0.18  // Slightly smaller to ensure scanability
          const x = (size - logoSize) / 2
          const y = (size - logoSize) / 2

          // Draw rounded white background for logo with shadow
          const padding = 6
          const bgSize = logoSize + (padding * 2)
          const bgX = x - padding
          const bgY = y - padding
          const radius = 8

          ctx.fillStyle = '#FFFFFF'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
          ctx.shadowBlur = 6
          ctx.shadowOffsetY = 2
          
          ctx.beginPath()
          ctx.moveTo(bgX + radius, bgY)
          ctx.lineTo(bgX + bgSize - radius, bgY)
          ctx.quadraticCurveTo(bgX + bgSize, bgY, bgX + bgSize, bgY + radius)
          ctx.lineTo(bgX + bgSize, bgY + bgSize - radius)
          ctx.quadraticCurveTo(bgX + bgSize, bgY + bgSize, bgX + bgSize - radius, bgY + bgSize)
          ctx.lineTo(bgX + radius, bgY + bgSize)
          ctx.quadraticCurveTo(bgX, bgY + bgSize, bgX, bgY + bgSize - radius)
          ctx.lineTo(bgX, bgY + radius)
          ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY)
          ctx.closePath()
          ctx.fill()
          
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetY = 0

          // Draw logo with rounded corners
          ctx.save()
          ctx.beginPath()
          ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, x, y, logoSize, logoSize)
          ctx.restore()
        }
        img.src = logo
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="rounded-lg shadow-lg"
        style={{
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges'
        } as any}
      />
      <p className="text-xs text-gray-600 font-medium text-center max-w-[200px]">
        Scan to view digital prescription
      </p>
    </div>
  )
}

