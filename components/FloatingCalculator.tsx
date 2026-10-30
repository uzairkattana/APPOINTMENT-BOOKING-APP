"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calculator,
  X,
  Copy,
  Check,
  Minimize2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FloatingCalculatorProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
}

export default function FloatingCalculator({ isOpen, onClose, onToggle }: FloatingCalculatorProps) {
  const [display, setDisplay] = useState("0")
  const [equation, setEquation] = useState("")
  const [isNewNumber, setIsNewNumber] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num)
      setIsNewNumber(false)
    } else {
      setDisplay(display === "0" ? num : display + num)
    }
  }

  const handleOperator = (op: string) => {
    if (!isNewNumber) {
      calculate()
    }
    setEquation(display + " " + op + " ")
    setIsNewNumber(true)
  }

  const handleEquals = () => {
    calculate()
  }

  const calculate = () => {
    try {
      const fullExpression = equation + display
      // Safe evaluation using Function constructor (safer than eval)
      const result = Function('"use strict"; return (' + fullExpression.replace(/[^0-9+\-*/().\s]/g, '') + ')')()
      
      if (isNaN(result) || !isFinite(result)) {
        setDisplay("Error")
        toast({
          title: "Calculation Error",
          description: "Invalid calculation. Please check your input.",
          variant: "destructive",
        })
      } else {
        const formattedResult = parseFloat(result.toFixed(8)).toString()
        setDisplay(formattedResult)
      }
      setEquation("")
      setIsNewNumber(true)
    } catch (error) {
      setDisplay("Error")
      setEquation("")
      setIsNewNumber(true)
      toast({
        title: "Calculation Error",
        description: "Invalid expression. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clear = () => {
    setDisplay("0")
    setEquation("")
    setIsNewNumber(true)
  }

  const clearEntry = () => {
    setDisplay("0")
    setIsNewNumber(true)
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay("0")
      setIsNewNumber(true)
    }
  }

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(display)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Result copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      {!isMinimized && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Calculator Window - Responsive */}
      <div className={`fixed z-50 transition-all duration-300 ${
        isMinimized 
          ? "bottom-6 right-6 w-16 h-16" 
          : "bottom-4 right-4 w-80 sm:w-96 max-w-[90vw] max-h-[80vh] overflow-auto"
      }`}>
        {isMinimized ? (
          /* Minimized State */
          <Button
            onClick={() => setIsMinimized(false)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2a9d8f] to-[#0d5c75] hover:from-[#238a7a] hover:to-[#0a4a5c] shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <Calculator className="h-6 w-6 text-white" />
          </Button>
        ) : (
          /* Simple Calculator Design */
          <Card className="shadow-2xl border-2 border-[#0d5c75]/20 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <CardTitle className="text-base font-bold">Calculator</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(true)}
                    className="text-white hover:bg-white/20 p-1.5 rounded-full transition-all duration-200"
                    title="Minimize Calculator"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 p-1.5 rounded-full transition-all duration-200"
                    title="Close Calculator"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-3">
              {/* Simple Display Section */}
              <div className="mb-3">
                {equation && (
                  <div className="text-sm text-[#0d5c75] mb-1 font-mono px-2 py-1 bg-gray-50 rounded">
                    {equation}
                  </div>
                )}
                <div className="bg-gray-900 text-white text-right text-xl sm:text-2xl p-4 rounded-lg font-mono min-h-[60px] flex items-center justify-between relative">
                  {/* Main Display */}
                  <div className="text-left text-xs text-gray-400">
                    PKR
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="break-all text-right flex-1">
                      {display === "Error" ? "Error" : display}
                    </span>
                    {/* Copy Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyResult}
                      className="text-white hover:bg-white/20 p-1 rounded transition-all duration-200 shrink-0"
                      title="Copy to Clipboard"
                    >
                      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Simple Main Calculator Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* Row 1 - Function Buttons */}
                <Button 
                  variant="outline" 
                  onClick={clearEntry} 
                  className="text-red-600 font-semibold hover:bg-red-50 border-red-200 h-10 sm:h-12 rounded-lg transition-all duration-200"
                  title="Clear Entry"
                >
                  CE
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clear} 
                  className="text-red-600 font-semibold hover:bg-red-50 border-red-200 h-10 sm:h-12 rounded-lg transition-all duration-200"
                  title="Clear All"
                >
                  C
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBackspace} 
                  className="text-orange-600 hover:bg-orange-50 border-orange-200 h-10 sm:h-12 rounded-lg transition-all duration-200"
                  title="Backspace"
                >
                  ⌫
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => handleOperator("/")} 
                  className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white h-10 sm:h-12 rounded-lg font-bold transition-all duration-200"
                  title="Divide"
                >
                  ÷
                </Button>

                {/* Row 2 - Numbers 7-9 */}
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("7")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  7
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("8")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  8
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("9")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  9
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => handleOperator("*")} 
                  className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white h-10 sm:h-12 rounded-lg font-bold transition-all duration-200"
                  title="Multiply"
                >
                  ×
                </Button>

                {/* Row 3 - Numbers 4-6 */}
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("4")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  4
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("5")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  5
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("6")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  6
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => handleOperator("-")} 
                  className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white h-10 sm:h-12 rounded-lg font-bold transition-all duration-200"
                  title="Subtract"
                >
                  −
                </Button>

                {/* Row 4 - Numbers 1-3 */}
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("1")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  1
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("2")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  2
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("3")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  3
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => handleOperator("+")} 
                  className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white h-10 sm:h-12 rounded-lg font-bold transition-all duration-200 row-span-2"
                  title="Add"
                >
                  +
                </Button>

                {/* Row 5 - Zero and Decimal */}
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber("0")} 
                  className="col-span-2 h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  0
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleNumber(".")} 
                  className="h-10 sm:h-12 rounded-lg font-semibold hover:bg-gray-50 border-gray-300 transition-all duration-200"
                >
                  .
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleEquals} 
                  className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white h-10 sm:h-12 rounded-lg font-bold transition-all duration-200"
                  title="Calculate Result"
                >
                  =
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

// Global Calculator Hook
export function useFloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    openCalculator: () => setIsOpen(true),
    closeCalculator: () => setIsOpen(false),
    toggleCalculator: () => setIsOpen(!isOpen)
  }
}
