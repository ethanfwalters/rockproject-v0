"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Mail, Calendar, Shield } from "lucide-react"
import { Button } from "@/features/shared/presentation/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/features/shared/presentation/card"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/features/navbar/presentation/navbar"

export default function ProfilePage() {
    const [user, setUser] = useState<{ email: string; created_at: string } | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (user) {
                setUser({
                    email: user.email || "",
                    created_at: user.created_at || "",
                })
            } else {
                router.push("/auth/login")
            }
        }
        getUser()
    }, [router])

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await fetch("/api/admin/check-status")
                if (response.ok) {
                    const data = await response.json()
                    setIsAdmin(data.isAdmin)
                }
            } catch (error) {
                console.error("Failed to check admin status:", error)
            }
        }
        checkAdminStatus()
    }, [])

    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-pulse">
                        <div className="h-12 w-12 mx-auto rounded-full bg-primary/20" />
                    </div>
                </div>
            </div>
        )
    }

    const getInitials = (email: string) => {
        return email.charAt(0).toUpperCase()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <Button variant="ghost" onClick={() => router.push("/collection")} className="mb-6 gap-2 rounded-full">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Collection
                </Button>

                <Card className="rounded-2xl border-border/50 py-6">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-4xl font-semibold text-primary">{getInitials(user.email)}</span>
                        </div>
                        <CardTitle className="text-2xl">Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Member since</p>
                                <p className="font-medium">{formatDate(user.created_at)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Account type</p>
                                {isAdmin ? (
                                    <p className="font-medium">Admin</p>
                                ) : (
                                    <p className="font-medium">Collector</p>
                                )}

                            </div>
                        </div>

                        {isAdmin && (
                            <Link href="/admin" className="block mt-4">
                                <Button variant="default" className="w-full gap-2">
                                    <Shield className="h-5 w-5" />
                                    Admin Dashboard
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
