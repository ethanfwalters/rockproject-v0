import type React from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { checkAdminAuth } from "@/lib/admin-auth"
import { Database, Home, Upload, BarChart3, Users } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = await checkAdminAuth()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-xl font-bold text-primary">
                Terralis Admin
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/specimens"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Database className="h-4 w-4" />
                  Specimens
                </Link>
                <Link
                  href="/admin/import"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Admin Users
                </Link>
              </nav>
            </div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
