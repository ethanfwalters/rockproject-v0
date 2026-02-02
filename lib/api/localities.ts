import { createClient } from "@/lib/supabase/server"
import type { Locality } from "@/types/locality"

const MAX_ANCESTOR_DEPTH = 50

export async function getAncestors(
  supabase: Awaited<ReturnType<typeof createClient>>,
  parentId: string | null,
  depth: number = 0
): Promise<Array<Locality>> {
  if (!parentId || depth >= MAX_ANCESTOR_DEPTH) return []

  const { data: parent, error } = await supabase
    .from("localities")
    .select("id, name, kind, parent_id, created_at")
    .eq("id", parentId)
    .single()

  if (error || !parent) return []

  const ancestors = await getAncestors(supabase, parent.parent_id, depth + 1)

  return [
    {
      id: parent.id,
      name: parent.name,
      kind: parent.kind,
      parentId: parent.parent_id,
      createdAt: parent.created_at,
    },
    ...ancestors,
  ]
}
