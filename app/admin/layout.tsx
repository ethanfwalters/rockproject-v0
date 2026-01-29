import type React from "react"
import { redirect } from "next/navigation"
import { checkAdminAuth } from "@/lib/admin-auth"
import { AdminLayout } from "@/features/admin/presentation/admin-layout"

export default async function AdminLayoutPage({ children }: { children: React.ReactNode }) {
  const { isAdmin } = await checkAdminAuth()

  if (!isAdmin) {
    redirect("/")
  }

  return <AdminLayout>{children}</AdminLayout>
}
