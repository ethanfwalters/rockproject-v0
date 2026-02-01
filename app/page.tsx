import { createClient } from "@/lib/supabase/server"
import Homepage from "@/features/homepage/presentation/homepage"
import { AuthenticatedHomepage } from "@/features/homepage/presentation/authenticated-homepage"

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email) {
    let username: string | null = null
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .single()
    if (profile) {
      username = profile.username
    }

    return <AuthenticatedHomepage userEmail={user.email} username={username} />
  }

  return <Homepage />
}
