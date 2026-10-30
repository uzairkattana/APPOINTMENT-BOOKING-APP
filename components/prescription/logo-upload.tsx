"use client"

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, Check, Image as ImageIcon, RotateCw } from 'lucide-react'
import Image from 'next/image'

interface LogoUploadProps {
  onLogoChange: (logo: string) => void
  currentLogo?: string
  className?: string
}

export function LogoUpload({ 
  onLogoChange, 
  currentLogo,
  className = '' 
}: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentLogo || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onLogoChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveLogo = () => {
    setPreview(null)
    onLogoChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleResetToDefault = () => {
    const defaultLogo = '/images/gonstead-chiropractic-logo-new.png'
    setPreview(defaultLogo)
    onLogoChange(defaultLogo)
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-[#245064] mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Clinic Logo
        </h3>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-8 transition-all duration-200
            ${isDragging 
              ? 'border-[#245064] bg-blue-50' 
              : preview 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }
          `}
        >
          {preview ? (
            <div className="flex flex-col items-center gap-4">
              {/* Logo Preview */}
              <div className="relative w-32 h-32 bg-white rounded-lg shadow-lg p-2 border-2 border-gray-200">
                <Image
                  src={preview}
                  alt="Logo Preview"
                  fill
                  className="object-contain rounded p-2"
                />
              </div>

              {/* Preview Info */}
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Check className="h-4 w-4" />
                <span className="font-medium">Logo uploaded successfully</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Change Logo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToDefault}
                  className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <RotateCw className="h-4 w-4" />
                  Default
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <Upload className="h-10 w-10 text-gray-400" />
              </div>
              
              <div>
                <p className="text-base font-medium text-gray-700 mb-1">
                  Upload Clinic Logo
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: PNG, JPG, SVG (Max 5MB)
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>

              <button
                onClick={handleResetToDefault}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Use Default Gonstead Logo
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Logo Tips */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-xs font-semibold text-blue-800 mb-2">💡 Logo Tips:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use a square or circular logo for best results</li>
            <li>• Transparent background (PNG) works best</li>
            <li>• Minimum recommended size: 200x200 pixels</li>
            <li>• Logo will appear in prescription header</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

