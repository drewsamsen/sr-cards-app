"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks"

export default function Home() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()

  useEffect(() => {
    if (isInitialized) {
      if (user) {
        router.push('/decks')
      } else {
        router.push('/login')
      }
    }
  }, [router, user, isInitialized])

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return null
}

