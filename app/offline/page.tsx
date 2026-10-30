"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Globe, Database } from "lucide-react"
import Image from "next/image"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Initial check
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  const goToOfflineMode = () => {
    window.location.href = '/admin/dashboard?offline=true'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(190,205,203)] to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-[#0d5c75]/20">
        <CardHeader className="text-center bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white rounded-t-lg">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image
              src="/images/gonstead-logo-new.png"
              alt="Gonstead Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold font-poppins">
            {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 text-center space-y-6">
          <div className="flex justify-center">
            {isOnline ? (
              <Globe className="h-16 w-16 text-green-500" />
            ) : (
              <WifiOff className="h-16 w-16 text-gray-400" />
            )}
          </div>

          <div className="space-y-3">
            {isOnline ? (
              <>
                <h3 className="text-lg font-semibold text-green-600">
                  Internet Connection Restored
                </h3>
                <p className="text-gray-600">
                  Your internet connection is back. Click below to refresh and sync your data.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-700">
                  No Internet Connection
                </h3>
                <p className="text-gray-600">
                  Don't worry! You can still use the clinic management system in offline mode. 
                  Your data will be saved locally and automatically synchronized when the connection returns.
                </p>
              </>
            )}
          </div>

          <div className="space-y-3">
            {isOnline ? (
              <Button 
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh & Sync Data
              </Button>
            ) : (
              <Button 
                onClick={goToOfflineMode}
                className="w-full bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] text-white"
              >
                <Database className="h-4 w-4 mr-2" />
                Continue in Offline Mode
              </Button>
            )}
            
            {!isOnline && (
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="w-full border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Connection Again {retryCount > 0 && `(${retryCount})`}
              </Button>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Offline Features Available:</h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• View and manage patient records</li>
              <li>• Create new appointments</li>
              <li>• Generate prescriptions</li>
              <li>• Access medical knowledge base</li>
              <li>• Export data to Excel/CSV</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500">
            All your offline changes will be automatically synchronized when internet connection is restored.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
