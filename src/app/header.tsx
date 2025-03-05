"use client"

import { useState } from "react"
import { useAuth } from "@/lib/hooks"
import { Button } from "@/components/ui/button"

export function Header() {
  const { user, logout, isLoading } = useAuth()
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      await logout()
      // Clear any previous errors on successful logout
      setLogoutError(null)
    } catch (error) {
      console.error('Error during logout:', error)
      setLogoutError('Failed to logout. Please try again.')
    }
  }

  return (
    <header className="w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between bg-gray-100 px-4">
        <h1 className="text-xl font-bold">SupaCards</h1>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">
                  {user.fullName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              {logoutError && (
                <span className="text-xs text-destructive">
                  {logoutError}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? "Logging out..." : "Log out"}
              </Button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Not logged in
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

