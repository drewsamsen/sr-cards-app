"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useUserSettings } from "@/lib/hooks"
import { useAuth } from "@/lib/hooks"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from localStorage first for immediate display
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      return savedTheme || "dark"
    }
    return "dark"
  })
  
  const { settings } = useUserSettings()
  const { user, isInitialized } = useAuth()

  // Apply theme from user settings when logged in
  useEffect(() => {
    if (isInitialized) {
      if (user && settings?.settings?.theme) {
        // User is logged in and has settings
        console.log("ThemeProvider: Setting theme from user settings:", settings.settings.theme)
        setTheme(settings.settings.theme as Theme)
      }
    }
  }, [settings, user, isInitialized])

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = window.document.documentElement
    
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }
    
    root.classList.add(theme)
    
    // Save to localStorage for persistence
    localStorage.setItem('theme', theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
    
  return context
} 