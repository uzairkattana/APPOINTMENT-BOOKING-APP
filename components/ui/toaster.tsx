"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 w-full">
              {/* Professional Icon based on variant */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                variant === 'destructive' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-[#0d5c75]/10 text-[#0d5c75]'
              }`}>
                {variant === 'destructive' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {title && (
                  <ToastTitle className={`font-bold text-base mb-1 ${
                    variant === 'destructive' ? 'text-red-800' : 'text-[#0d5c75]'
                  }`}>
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className={`text-sm leading-relaxed ${
                    variant === 'destructive' ? 'text-red-700' : 'text-[#0d5c75]/80'
                  }`}>
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className={`${
              variant === 'destructive' 
                ? 'text-red-400 hover:text-red-600' 
                : 'text-[#0d5c75]/60 hover:text-[#0d5c75]'
            }`} />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col p-4 md:max-w-[420px]" />
    </ToastProvider>
  )
}
