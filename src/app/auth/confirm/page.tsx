"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

// Component that uses useSearchParams
function EmailConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    // Check URL parameters to determine status
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')
    
    // Brief timeout to ensure UI renders properly
    setTimeout(() => {
      if (error) {
        setStatus('error')
        setMessage(error_description || "Failed to verify your email. The link may have expired.")
      } else {
        setStatus('success')
        setMessage("Your email has been successfully verified! You can now log in to your account.")
      }
    }, 500)
  }, [searchParams])

  const handleGoToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Processing your verification...' : 
             status === 'success' ? 'Your email has been verified!' : 
             'Email verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                Please wait a moment...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <Alert className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGoToLogin} 
            className="w-full"
            disabled={status === 'loading'}
          >
            {status === 'success' ? 'Go to Login' : 'Back to Login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Loading fallback
function ConfirmationLoading() {
  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>Loading verification page...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Loading...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main page component with Suspense
export default function ConfirmPage() {
  return (
    <PageLayout>
      <Suspense fallback={<ConfirmationLoading />}>
        <EmailConfirmation />
      </Suspense>
    </PageLayout>
  )
} 