"use client"

import { useState } from "react"
import { Card } from "@/features/shared/presentation/card"
import { Button } from "@/features/shared/presentation/button"
import { Input } from "@/features/shared/presentation/input"
import { Label } from "@/features/shared/presentation/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/features/shared/presentation/alert-dialog"
import {
  useAdminUsers,
  useAddAdminUser,
  useRemoveAdminUser,
  useToggleSuperAdmin,
} from "@/features/admin/application/client/adminUsers"
import { UserPlus, Trash2, Shield, ShieldOff } from "lucide-react"

export default function AdminUsersPage() {
  const [email, setEmail] = useState("")
  const [makeSuperAdmin, setMakeSuperAdmin] = useState(false)
  const [error, setError] = useState("")

  const { data: admins, isLoading } = useAdminUsers()
  const addMutation = useAddAdminUser()
  const removeMutation = useRemoveAdminUser()
  const toggleMutation = useToggleSuperAdmin()

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    try {
      await addMutation.mutateAsync({ email: email.trim(), isSuperAdmin: makeSuperAdmin })
      setEmail("")
      setMakeSuperAdmin(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleToggleSuperAdmin = async (id: string, currentStatus: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, isSuperAdmin: !currentStatus })
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Admin Users</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Users</h1>
        <p className="text-muted-foreground mt-2">Manage admin users and super admin privileges</p>
      </div>

      {/* Add New Admin Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              User must have an existing account
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="super-admin"
              checked={makeSuperAdmin}
              onChange={(e) => setMakeSuperAdmin(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="super-admin" className="cursor-pointer">
              Grant Super Admin privileges
            </Label>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" disabled={addMutation.isPending} className="gap-2">
            <UserPlus className="h-4 w-4" />
            {addMutation.isPending ? "Adding..." : "Add Admin"}
          </Button>
        </form>
      </Card>

      {/* Admin Users List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Admin Users ({admins?.length || 0})</h2>
        <div className="space-y-3">
          {admins?.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between border border-border p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    admin.is_super_admin
                      ? "bg-purple-500/10 text-purple-500"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{admin.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {admin.is_super_admin ? "Super Admin" : "Admin"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleSuperAdmin(admin.id, admin.is_super_admin)}
                  disabled={toggleMutation.isPending}
                  className="gap-2"
                >
                  {admin.is_super_admin ? (
                    <>
                      <ShieldOff className="h-4 w-4" />
                      Revoke Super Admin
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Make Super Admin
                    </>
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={removeMutation.isPending}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Admin Access?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove admin access for {admin.email}. They will no longer be
                        able to access the admin dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemove(admin.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {removeMutation.isPending ? "Removing..." : "Remove Admin"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>

        {admins?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No admin users found</p>
        )}
      </Card>
    </div>
  )
}
