"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/features/shared/presentation/button"
import { Input } from "@/features/shared/presentation/input"
import { Label } from "@/features/shared/presentation/label"
import { Navbar } from "@/features/navbar/presentation/navbar"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateUsername = (value: string): string | null => {
    if (value.length < 3) return "Username must be at least 3 characters"
    if (value.length > 30) return "Username must be at most 30 characters"
    if (!/^[a-z0-9_]+$/.test(value)) return "Username can only contain lowercase letters, numbers, and underscores"
    return null
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    const usernameError = validateUsername(username)
    if (usernameError) {
      setError(usernameError)
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })
      if (error) throw error

      // Create profile with username
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ user_id: data.user.id, username })

        if (profileError) {
          if (profileError.code === "23505") {
            throw new Error("This username is already taken")
          }
          throw new Error(profileError.message)
        }
      }

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-muted-foreground mt-2">
              Start tracking your rock, mineral, and fossil collection
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="rock_collector"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="h-11"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                3-30 characters. Lowercase letters, numbers, and underscores only.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat-password">Confirm password</Label>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
