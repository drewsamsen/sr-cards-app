"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import { Header } from "@/components/header"
import { Smartphone, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

// Create context to share phone mode state
type PhoneModeContextType = {
  isPhoneMode: boolean
  isEmulatedPhone: boolean
}

export const PhoneModeContext = createContext<PhoneModeContextType>({
  isPhoneMode: false,
  isEmulatedPhone: false
})

// Custom hook to use the phone mode context
export const usePhoneMode = () => useContext(PhoneModeContext)

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  // Default to phone mode on wider screens
  const [isPhoneMode, setIsPhoneMode] = useState(true)
  // Track if we're on an actual small screen device
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  
  // Check screen size and load saved preference on first render
  useEffect(() => {
    // Check if we're on a small screen device
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }
    
    // Initial check
    checkScreenSize()
    
    // Set up listener for resize events
    window.addEventListener('resize', checkScreenSize)
    
    // Load saved preference (only matters on larger screens)
    const savedMode = localStorage.getItem('displayMode')
    if (savedMode === 'desktop') {
      setIsPhoneMode(false)
    }
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])
  
  // Toggle between phone and desktop mode
  const toggleDisplayMode = () => {
    const newMode = !isPhoneMode
    setIsPhoneMode(newMode)
    localStorage.setItem('displayMode', newMode ? 'phone' : 'desktop')
  }
  
  // Determine if we're in emulated phone mode (phone mode on a larger screen)
  const isEmulatedPhone = isPhoneMode && !isSmallScreen
  
  // Create context value
  const phoneModeValue = {
    isPhoneMode: isPhoneMode || isSmallScreen,
    isEmulatedPhone
  }
  
  return (
    <PhoneModeContext.Provider value={phoneModeValue}>
      <div className={`flex min-h-screen flex-col ${isEmulatedPhone ? 'bg-[#1a1f36]' : 'bg-background'}`}>
        {/* Only show toggle button on larger screens */}
        {!isSmallScreen && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="flex rounded-lg overflow-hidden shadow-lg border border-muted/40 bg-background/90 backdrop-blur-sm">
              <button
                onClick={() => !isPhoneMode && toggleDisplayMode()}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                  isPhoneMode 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>Mobile</span>
              </button>
              <div className="w-px bg-border"></div>
              <button
                onClick={() => isPhoneMode && toggleDisplayMode()}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                  !isPhoneMode 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                }`}
              >
                <Monitor className="h-4 w-4" />
                <span>Desktop</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Apply phone frame only if in phone mode AND on a larger screen */}
        {isEmulatedPhone ? (
          <div className="flex-1 container mx-auto px-2 sm:px-4 py-2 sm:py-3 md:py-4">
            <div className="mx-auto max-w-[430px] h-[860px] border dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl bg-background flex flex-col transform-gpu translate-y-1 rotate-0 relative before:absolute before:inset-0 before:-z-10 before:translate-y-5 before:scale-[1.02] before:blur-2xl before:rounded-3xl before:bg-black/30 dark:before:bg-black/60">
              {/* Phone status bar */}
              <div className="h-6 bg-black/10 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                <div className="w-24 h-4 bg-black/20 dark:bg-white/10 rounded-full"></div>
              </div>
              
              {/* Header inside phone view */}
              <div className="flex-shrink-0">
                <Header />
              </div>
              
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto relative phone-emulator-mode">
                <main className="p-2 sm:p-3 min-h-full flex flex-col">
                  {children}
                </main>
              </div>
              
              {/* Bottom phone "home indicator" */}
              <div className="h-6 bg-background flex items-center justify-center flex-shrink-0">
                <div className="w-24 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Regular header for desktop view or small screens */}
            <Header />
            
            <main className="flex-1 container mx-auto px-2 sm:px-4 py-2 sm:py-3 md:py-4">
              <div className="mt-2 sm:mt-3">
                {children}
              </div>
            </main>
          </>
        )}
      </div>
    </PhoneModeContext.Provider>
  )
} 