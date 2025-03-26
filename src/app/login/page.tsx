"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/hooks"
import { PageLayout } from "@/components/page-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register, isLoading, error, clearError, user, isInitialized } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [isLoginView, setIsLoginView] = useState(true)
  const [isDemoLoading, setIsDemoLoading] = useState(false)

  // Redirect to decks page if already logged in
  useEffect(() => {
    if (isInitialized && user) {
      router.push('/decks')
    }
  }, [user, router, isInitialized])

  // Clear form error when API error changes
  useEffect(() => {
    if (error) {
      setFormError(error)
    }
  }, [error])

  // Check for demo parameter in URL
  useEffect(() => {
    const demoParam = searchParams.get('demo')
    if (demoParam === 'true' && !isDemoLoading && !isLoading) {
      // Set to login view
      setIsLoginView(true)
      
      // Small timeout to ensure the form state updates before triggering demo login
      setTimeout(() => {
        handleDemoLogin()
      }, 100)
      
      // Clean URL by removing query parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams, isDemoLoading, isLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors when user types
    if (formError) {
      setFormError(null)
      clearError()
    }
    
    // Clear registration success when user types
    if (registrationSuccess) {
      setRegistrationSuccess(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (isLoginView) {
      // Login form submission
      // Basic validation
      if (!formData.email || !formData.password) {
        setFormError('Please fill in all required fields')
        return
      }
      
      const success = await login({
        email: formData.email,
        password: formData.password,
      })
      
      if (success) {
        // Reset form data after successful login
        setFormData({
          email: '',
          password: '',
          name: '',
        })
        
        // Navigate to decks page
        router.push('/decks')
      }
    } else {
      // Register form submission
      // Basic validation for registration
      if (!formData.email || !formData.password) {
        setFormError('Please fill in all required fields')
        return
      }
      
      // Password strength validation
      if (formData.password.length < 8) {
        setFormError('Password must be at least 8 characters long')
        return
      }
      
      const success = await register({
        email: formData.email,
        password: formData.password,
        name: formData.email.split('@')[0], // Use part of email as name
      })
      
      if (success) {
        // Reset form data after successful registration
        setFormData({
          email: '',
          password: '',
          name: '',
        })
        
        // Show success message
        setRegistrationSuccess(true)
        
        // Switch to login view after successful registration
        setIsLoginView(true)
      }
    }
  }

  const handleDemoLogin = () => {
    // Ensure login view is active
    setIsLoginView(true)
    
    setIsDemoLoading(true)
    
    try {
      // Set demo credentials in the form
      setFormData({
        email: 'demo@example.com',
        password: 'demopassword',
        name: '', // Not needed for login
      })
      
      // Small timeout to ensure the form state updates before submission
      setTimeout(() => {
        // Get the login form element and submit it
        const loginForm = document.getElementById('auth-form') as HTMLFormElement
        if (loginForm) {
          loginForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        } else {
          console.error('Login form not found')
          setFormError('Could not find login form')
        }
        setIsDemoLoading(false)
      }, 50)
    } catch (error) {
      console.error('Demo login error:', error)
      setFormError('Failed to login with demo account')
      setIsDemoLoading(false)
    }
  }

  const toggleView = () => {
    setIsLoginView(!isLoginView)
    setFormError(null)
    clearError()
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-8">
        <Card className="w-full max-w-md border-0 dark:bg-gray-900/50 shadow-lg overflow-hidden">
          <form id="auth-form" onSubmit={handleSubmit}>
            <CardHeader className="px-6 pt-6 pb-0">
              <h1 className="text-2xl font-bold mb-1">
                {isLoginView ? 'Login' : 'Create an account'}
              </h1>
            </CardHeader>
            
            <CardContent className="space-y-6 px-6 pt-6">
              {formError && (
                <Alert variant="destructive" className="mb-4 bg-destructive/10 dark:bg-destructive/20 border-destructive/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">{formError}</AlertDescription>
                </Alert>
              )}
              
              {registrationSuccess && (
                <Alert className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Registration successful!</p>
                    <p className="mt-1">
                      We&apos;ve sent a confirmation link to your email address. 
                      Please check your inbox (and spam folder) and click the link to activate your account.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="name@example.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                  className="h-12 px-4 bg-background dark:bg-gray-800/90 border-muted/60"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base">Password</Label>
                  {isLoginView && (
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Forgot password?
                    </Button>
                  )}
                </div>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                  className="h-12 px-4 bg-background dark:bg-gray-800/90 border-muted/60"
                />
                {!isLoginView && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-6 pt-2 pb-6">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium" 
                disabled={isLoading || isDemoLoading}
              >
                {isLoading ? 
                  (isLoginView ? "Logging in..." : "Creating account...") : 
                  (isLoginView ? "Login" : "Create account")
                }
              </Button>
              
              <div className="text-center text-sm">
                {isLoginView ? (
                  <p className="text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button 
                      type="button"
                      onClick={toggleView}
                      className="text-primary hover:underline font-medium"
                    >
                      Register
                    </button>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <button 
                      type="button"
                      onClick={toggleView}
                      className="text-primary hover:underline font-medium"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageLayout>
  )
} 