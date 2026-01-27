import { createClient } from "@/lib/supabase/server"
import Homepage from "@/features/homepage/presentation/homepage"
import { AuthenticatedHomepage } from "@/features/homepage/presentation/authenticated-homepage"

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email) {
    return <AuthenticatedHomepage userEmail={user.email} />
  }

  return <Homepage />
}
