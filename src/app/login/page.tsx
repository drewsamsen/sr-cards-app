"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [activeTab, setActiveTab] = useState("login")
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
      // Set active tab to login (in case user was on register)
      setActiveTab("login")
      
      // Small timeout to ensure the tab has changed before triggering demo login
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
    
    // Get the form ID to determine if it's login or register
    const formId = event.currentTarget.id
    
    if (formId === 'login-form') {
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
    } else if (formId === 'register-form') {
      // Basic validation for registration
      if (!formData.email || !formData.password || !formData.name) {
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
        name: formData.name,
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
        
        // Switch to login tab after successful registration
        setActiveTab("login")
      }
    }
  }

  const handleDemoLogin = () => {
    // Ensure login tab is active
    setActiveTab("login")
    
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
        const loginForm = document.getElementById('login-form') as HTMLFormElement
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

  return (
    <PageLayout>
      <div className="flex items-start justify-center">
        <Card className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form id="login-form" onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="text-2xl">Login</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{formError}</AlertDescription>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="name@example.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button variant="link" className="p-0 h-auto text-sm">
                        Forgot password?
                      </Button>
                    </div>
                    <Input 
                      id="password" 
                      name="password"
                      type="password" 
                      value={formData.password}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form id="register-form" onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>Enter your details to create a new account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input 
                      id="email-register" 
                      name="email"
                      type="email" 
                      placeholder="name@example.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Password</Label>
                    <Input 
                      id="password-register" 
                      name="password"
                      type="password" 
                      value={formData.password}
                      onChange={handleInputChange}
                      required 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageLayout>
  )
} 