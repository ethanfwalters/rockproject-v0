import { createClient } from "@supabase/supabase-js"
import { FAKE_EMAIL_DOMAIN } from "./seed-config"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function cleanup() {
  console.log("Starting cleanup of fake users...\n")

  // List all auth users (paginate if needed)
  const allUsers: { id: string; email?: string }[] = []
  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      console.error("Failed to list users:", error.message)
      process.exit(1)
    }

    allUsers.push(...data.users)

    if (data.users.length < perPage) break
    page++
  }

  const fakeUsers = allUsers.filter((u) => u.email?.endsWith(`@${FAKE_EMAIL_DOMAIN}`))

  if (fakeUsers.length === 0) {
    console.log("No fake users found. Nothing to clean up.")
    return
  }

  console.log(`Found ${fakeUsers.length} fake user(s) to remove.\n`)

  let deleted = 0
  const failures: string[] = []

  for (const user of fakeUsers) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) throw new Error(error.message)

      deleted++
      console.log(`  Deleted: ${user.email}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      failures.push(`${user.email}: ${msg}`)
      console.error(`  FAILED to delete ${user.email}: ${msg}`)
    }
  }

  console.log("\n--- Summary ---")
  console.log(`Deleted: ${deleted}/${fakeUsers.length}`)
  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`)
    failures.forEach((f) => console.log(`  - ${f}`))
  }
  console.log("\nDone.")
}

cleanup()
