import { Suspense } from "react"
import LandingPage from "@/features/landingPage/presentation/LandingPage"

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LandingPage />
    </Suspense>
  )
}