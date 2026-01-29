import type { ImportResult } from "@/features/admin/domain/types"

export async function importSpecimens(
  specimens: Record<string, string>[],
  skipDuplicates: boolean
): Promise<ImportResult> {
  const response = await fetch("/api/admin/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ specimens, skipDuplicates }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to import specimens")
  }

  return data.results
}
