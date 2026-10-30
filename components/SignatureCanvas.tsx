"use client"

import React, { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eraser, RotateCcw, PenTool } from "lucide-react"

interface SignatureCanvasProps {
  onSignatureChange?: (dataUrl: string | null) => void
  width?: number
  height?: number
}

export function SignatureCanvas({ onSignatureChange, width = 500, height = 200 }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas background to white
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Configure drawing style
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()

    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    
    // Notify parent component about signature change
    if (hasSignature && onSignatureChange) {
      const canvas = canvasRef.current
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png")
        onSignatureChange(dataUrl)
      }
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    
    if (onSignatureChange) {
      onSignatureChange(null)
    }
  }

  const redoSignature = () => {
    clearSignature()
  }

  return (
    <Card>
      <CardHeader className="bg-[#0d5c75] text-white py-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <PenTool className="h-4 w-4" />
          Doctor&apos;s Signature
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="cursor-crosshair w-full"
              style={{ touchAction: "none" }}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={clearSignature}
              className="flex items-center gap-1"
            >
              <Eraser className="h-3 w-3" />
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={redoSignature}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Redo
            </Button>
          </div>
          {!hasSignature && (
            <p className="text-xs text-gray-500 text-center">
              Draw your signature above using your mouse or touchpad
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

