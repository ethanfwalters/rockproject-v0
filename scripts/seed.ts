import { createClient } from "@supabase/supabase-js"
import { faker } from "@faker-js/faker"
import {
  FAKE_EMAIL_DOMAIN,
  USER_COUNT,
  TARGET_TOTAL_SPECIMENS,
  DEFAULT_PASSWORD,
} from "./seed-config"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/** Generate a username that matches ^[a-z0-9_]{3,30}$ */
function generateUsername(): string {
  const raw = faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, "")
  // Ensure at least 3 chars
  const padded = raw.length < 3 ? raw + "usr" : raw
  return padded.slice(0, 30)
}

/** Distribute totalCount items unevenly across bucketCount buckets */
function distributeUnevenly(totalCount: number, bucketCount: number): number[] {
  // Give each bucket a random weight, then distribute proportionally
  const weights = Array.from({ length: bucketCount }, () => Math.random() + 0.3)
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  const counts = weights.map((w) => Math.max(1, Math.round((w / totalWeight) * totalCount)))

  // Adjust to hit the target total
  let diff = totalCount - counts.reduce((sum, c) => sum + c, 0)
  while (diff !== 0) {
    const idx = Math.floor(Math.random() * bucketCount)
    if (diff > 0) {
      counts[idx]++
      diff--
    } else if (counts[idx] > 1) {
      counts[idx]--
      diff++
    }
  }

  return counts
}

/** Pick random items from an array */
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/** Generate a random date within the last 6 months */
function randomRecentDate(): string {
  return faker.date.recent({ days: 180 }).toISOString()
}

async function seed() {
  console.log("Starting seed...\n")

  // 1. Fetch existing minerals and localities
  const { data: minerals, error: minErr } = await supabase
    .from("minerals")
    .select("id")
    .eq("status", "approved")

  if (minErr) {
    console.error("Failed to fetch minerals:", minErr.message)
    process.exit(1)
  }

  const { data: localities, error: locErr } = await supabase
    .from("localities")
    .select("id")

  if (locErr) {
    console.error("Failed to fetch localities:", locErr.message)
    process.exit(1)
  }

  if (!minerals?.length) {
    console.error("No approved minerals found in the database. Seed some minerals first.")
    process.exit(1)
  }

  console.log(`Found ${minerals.length} approved minerals and ${localities?.length ?? 0} localities\n`)

  const mineralIds = minerals.map((m) => m.id)
  const localityIds = (localities ?? []).map((l) => l.id)
  const specimenCounts = distributeUnevenly(TARGET_TOTAL_SPECIMENS, USER_COUNT)

  let usersCreated = 0
  let totalSpecimensCreated = 0
  const failures: string[] = []

  for (let i = 0; i < USER_COUNT; i++) {
    const username = generateUsername()
    const email = `${username}@${FAKE_EMAIL_DOMAIN}`
    const specimenCount = specimenCounts[i]

    try {
      // Create auth user
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      })

      if (authErr || !authData.user) {
        throw new Error(authErr?.message ?? "Failed to create auth user")
      }

      const userId = authData.user.id

      // Insert profile
      const { error: profileErr } = await supabase.from("profiles").insert({
        user_id: userId,
        username,
      })

      if (profileErr) {
        throw new Error(`Profile insert failed: ${profileErr.message}`)
      }

      // Insert specimens
      const specimens = Array.from({ length: specimenCount }, () => {
        const numMinerals = faker.number.int({ min: 1, max: 3 })
        const hasLocality = localityIds.length > 0 && Math.random() < 0.8
        const hasDimensions = Math.random() < 0.7

        return {
          user_id: userId,
          mineral_ids: pickRandom(mineralIds, numMinerals),
          locality_id: hasLocality
            ? localityIds[Math.floor(Math.random() * localityIds.length)]
            : null,
          length: hasDimensions ? faker.number.int({ min: 5, max: 300 }) : null,
          width: hasDimensions ? faker.number.int({ min: 5, max: 300 }) : null,
          height: hasDimensions ? faker.number.int({ min: 5, max: 200 }) : null,
          is_public: Math.random() < 0.6,
          created_at: randomRecentDate(),
        }
      })

      const { error: specErr } = await supabase.from("specimens").insert(specimens)

      if (specErr) {
        throw new Error(`Specimen insert failed: ${specErr.message}`)
      }

      usersCreated++
      totalSpecimensCreated += specimenCount
      console.log(`  [${i + 1}/${USER_COUNT}] ${username} — ${specimenCount} specimens`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      failures.push(`${email}: ${msg}`)
      console.error(`  [${i + 1}/${USER_COUNT}] FAILED (${email}): ${msg}`)
    }
  }

  console.log("\n--- Summary ---")
  console.log(`Users created:     ${usersCreated}/${USER_COUNT}`)
  console.log(`Specimens created: ${totalSpecimensCreated}`)
  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`)
    failures.forEach((f) => console.log(`  - ${f}`))
  }
  console.log("\nDone.")
}

seed()
