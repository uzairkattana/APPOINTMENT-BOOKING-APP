"use client"

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, RotateCcw, Check, Pen, Upload } from 'lucide-react'

interface SignaturePadProps {
  onSave: (signature: string) => void
  onClose: () => void
  title?: string
  existingSignature?: string
}

export function SignaturePad({ 
  onSave, 
  onClose, 
  title = "Draw Your Signature",
  existingSignature 
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    // Configure drawing style
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    setContext(ctx)

    // Load existing signature if provided
    if (existingSignature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2)
        setHasDrawn(true)
      }
      img.src = existingSignature
    }
  }, [existingSignature])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return
    
    setIsDrawing(true)
    setHasDrawn(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    if (!context) return
    setIsDrawing(false)
    context.closePath()
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signature = canvas.toDataURL('image/png')
    onSave(signature)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas || !context) return

        // Clear canvas first
        context.clearRect(0, 0, canvas.width, canvas.height)

        // Calculate scaling to fit canvas while maintaining aspect ratio
        const canvasWidth = canvas.width / 2
        const canvasHeight = canvas.height / 2
        const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height)
        const x = (canvasWidth - img.width * scale) / 2
        const y = (canvasHeight - img.height * scale) / 2

        context.drawImage(img, x, y, img.width * scale, img.height * scale)
        setHasDrawn(true)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="min-h-screen w-full flex items-center justify-center py-8">
        <Card className="w-full max-w-2xl shadow-2xl my-auto">
          <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pen className="h-5 w-5 text-[#245064]" />
              <h2 className="text-xl font-bold text-[#245064]">{title}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Canvas Area */}
          <div className="mb-4">
            <div className="border-2 border-dashed border-[#245064] rounded-lg p-2 bg-gray-50">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-64 bg-white rounded cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Draw your signature in the box above using mouse or touch, or upload an image
            </p>
          </div>

          {/* Upload Option */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-[#245064] text-[#245064] hover:bg-[#245064] hover:text-white"
            >
              <Upload className="h-4 w-4" />
              Upload Signature Image
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={clearSignature}
              disabled={!hasDrawn}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={saveSignature}
              disabled={!hasDrawn}
              className="bg-[#245064] hover:bg-[#2e6478] text-white flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Save Signature
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
