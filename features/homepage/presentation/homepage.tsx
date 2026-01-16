"use client"

import Link from "next/link"
import { Button } from "@/features/shared/presentation/button"
import { Navbar } from "@/features/navbar/presentation/navbar"

export function Homepage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <main>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
            {/* Logo Large */}
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-10 w-10 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Terralis
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mb-10">
              Track and showcase your rock, mineral, and fossil collection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl">
                <Link href="/auth/sign-up">Start Your Collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl bg-transparent">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
