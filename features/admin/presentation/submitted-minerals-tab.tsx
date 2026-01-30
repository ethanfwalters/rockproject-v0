"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/features/shared/presentation/card"
import { Button } from "@/features/shared/presentation/button"
import { Input } from "@/features/shared/presentation/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/shared/presentation/alert-dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  fetchSubmittedMinerals,
  reviewMineral,
} from "@/features/admin/application/client/mineralsAdmin"

type StatusFilter = "pending" | "approved" | "rejected" | "all"

export function SubmittedMineralsTab() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [page, setPage] = useState(1)

  // Review dialog state
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved")
  const [adminNotes, setAdminNotes] = useState("")
  const [reviewing, setReviewing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-submitted-minerals", statusFilter, page],
    queryFn: () => fetchSubmittedMinerals({ status: statusFilter, page, limit: 50 }),
  })

  const submissions = data?.submissions || []
  const pagination = data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 }

  function openReviewDialog(id: string, action: "approved" | "rejected") {
    setReviewId(id)
    setReviewAction(action)
    setAdminNotes("")
  }

  function closeReviewDialog() {
    setReviewId(null)
    setAdminNotes("")
  }

  async function handleReview() {
    if (!reviewId) return
    if (reviewAction === "rejected" && !adminNotes.trim()) return

    setReviewing(true)
    try {
      await reviewMineral(reviewId, {
        status: reviewAction,
        adminNotes: adminNotes.trim() || undefined,
      })
      queryClient.invalidateQueries({ queryKey: ["admin-submitted-minerals"] })
      closeReviewDialog()
    } catch {
      // Error handled by reviewMineral throwing
    } finally {
      setReviewing(false)
    }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      approved: "bg-green-500/10 text-green-700 dark:text-green-400",
      rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
    }
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] || "bg-muted text-muted-foreground"}`}
      >
        {status}
      </span>
    )
  }

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "All", value: "all" },
  ]

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        {filterButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={statusFilter === btn.value ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter(btn.value)
              setPage(1)
            }}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Submissions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Chemical Formula</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Variety</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Submitted By</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No submissions found
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 font-medium capitalize">{submission.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {submission.chemicalFormula || "\u2014"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          submission.isVariety
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {submission.isVariety ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {submission.submitterEmail || "\u2014"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{statusBadge(submission.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {submission.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-700 dark:text-green-400"
                            onClick={() => openReviewDialog(submission.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => openReviewDialog(submission.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Review Dialog */}
      <AlertDialog open={!!reviewId} onOpenChange={(open) => !open && closeReviewDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewAction === "approved" ? "Approve Mineral?" : "Reject Mineral?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewAction === "approved"
                ? "This mineral will be added to the approved minerals database and available to all users."
                : "This mineral submission will be rejected. Please provide a reason."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium">
              {reviewAction === "rejected" ? "Rejection reason (required)" : "Admin notes (optional)"}
            </label>
            <Input
              className="mt-1"
              placeholder={
                reviewAction === "rejected"
                  ? "Enter reason for rejection..."
                  : "Enter optional notes..."
              }
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReview}
              disabled={reviewing || (reviewAction === "rejected" && !adminNotes.trim())}
              className={
                reviewAction === "approved"
                  ? ""
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {reviewing
                ? reviewAction === "approved"
                  ? "Approving..."
                  : "Rejecting..."
                : reviewAction === "approved"
                  ? "Approve"
                  : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
