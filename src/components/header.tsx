"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Menu, X, Sparkles } from "lucide-react"

export function Header() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Decks", href: "/decks" },
    { name: "Cards", href: "/cards" },
    { name: "Import", href: "/import" },
    { name: "Settings", href: "/settings" },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      // Clear any previous errors on successful logout
      setLogoutError(null)
      // Navigate to login page after logout
      router.push('/login')
    } catch (error) {
      console.error('Error during logout:', error)
      setLogoutError('Failed to logout. Please try again.')
    }
  }

  const handleDemoLogin = () => {
    // Redirect to login page with special query parameter to trigger demo login
    router.push('/login?demo=true')
  }

  return (
    <header className="w-full border-b bg-background">
      <div className="max-w-screen-xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/decks" className="hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold text-foreground">SupaCards</h1>
          </Link>
          
          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex">
              <ul className="flex space-x-6">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-3 pr-0">
          {user ? (
            <>
              {/* Mobile menu button - only show when user is logged in */}
              <button 
                className="md:hidden p-2 rounded-md text-foreground hover:bg-accent ml-auto -mr-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">
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
                className="hidden md:inline-flex"
              >
                {isLoading ? "Logging out..." : "Log out"}
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={handleDemoLogin}
              className="flex items-center"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              Try Demo
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-border">
          <nav className="px-4 py-3">
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="px-4 py-3 border-t border-border">
            <div className="flex flex-col mb-2">
              <span className="text-sm font-medium text-foreground">
                {user.fullName}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </div>
      )}
      
      {/* Mobile: Not logged in */}
      {mobileMenuOpen && !user && (
        <div className="md:hidden border-t border-border">
          <div className="px-4 py-3 flex flex-col gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => {
                handleDemoLogin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              Try Demo
            </Button>
          </div>
        </div>
      )}
    </header>
  )
} 