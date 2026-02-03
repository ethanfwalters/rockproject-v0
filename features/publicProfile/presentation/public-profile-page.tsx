"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Gem, MapPin, Calendar, Settings, User } from "lucide-react"
import { Navbar } from "@/features/navbar/presentation/navbar"
import { Card } from "@/features/shared/presentation/card"
import {
  fetchPublicProfile,
  NotFoundError,
} from "../application/client/fetchPublicProfile"
import type { PublicProfileData } from "../domain/types"

interface PublicProfilePageProps {
  username: string
}

export function PublicProfilePage({ username }: PublicProfilePageProps) {
  const [data, setData] = useState<PublicProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchPublicProfile(username)
        setData(result)
      } catch (err) {
        if (err instanceof NotFoundError) {
          setNotFound(true)
        } else {
          console.error("Failed to load profile:", err)
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [username])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse">
            <div className="h-12 w-12 mx-auto rounded-full bg-primary/20" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground mb-6">
            The profile &ldquo;{username}&rdquo; doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="text-primary hover:underline text-sm font-medium"
          >
            Go back home
          </Link>
        </main>
      </div>
    )
  }

  const { profile, isOwnProfile, stats, specimens } = data
  const initial = profile.username.charAt(0).toUpperCase()
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-semibold text-primary">
              {initial}
            </span>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 justify-center sm:justify-start">
              <Calendar className="h-3.5 w-3.5" />
              Member since {memberSince}
            </p>
            {isOwnProfile && (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mt-2"
              >
                <Settings className="h-3.5 w-3.5" />
                Account Settings
              </Link>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.totalSpecimens}</p>
            <p className="text-xs text-muted-foreground">
              Public Specimens
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.uniqueMinerals}</p>
            <p className="text-xs text-muted-foreground">Minerals</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.uniqueLocalities}</p>
            <p className="text-xs text-muted-foreground">Localities</p>
          </Card>
        </div>

        {/* Specimens Grid */}
        {specimens.length === 0 ? (
          <div className="text-center py-16">
            <Gem className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              No public specimens yet.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specimens.map((specimen) => (
              <Card
                key={specimen.id}
                className="overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {specimen.imageUrl ? (
                    <Image
                      src={specimen.imageUrl}
                      alt={specimen.mineralNames.join(", ") || "Specimen"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <Gem className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">
                    {specimen.mineralNames.join(", ") || "Unknown"}
                  </h3>
                  {specimen.locality && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{specimen.locality}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Added {new Date(specimen.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
