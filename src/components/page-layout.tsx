"use client"

import React from "react"
import { Header } from "@/components/header"

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-2 sm:py-3 md:py-4">
        <div className="mt-2 sm:mt-3">
          {children}
        </div>
      </main>
    </div>
  )
} 