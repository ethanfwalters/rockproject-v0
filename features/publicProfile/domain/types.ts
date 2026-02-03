import { z } from "zod"

export const PublicProfileSpecimenSchema = z.object({
  id: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  mineralNames: z.array(z.string()),
  locality: z.string().nullable(),
})

export type PublicProfileSpecimen = z.infer<typeof PublicProfileSpecimenSchema>

export const PublicProfileStatsSchema = z.object({
  totalSpecimens: z.number(),
  uniqueMinerals: z.number(),
  uniqueLocalities: z.number(),
})

export type PublicProfileStats = z.infer<typeof PublicProfileStatsSchema>

export const PublicProfileDataSchema = z.object({
  profile: z.object({
    username: z.string(),
    createdAt: z.string(),
  }),
  isOwnProfile: z.boolean(),
  stats: PublicProfileStatsSchema,
  specimens: z.array(PublicProfileSpecimenSchema),
})

export type PublicProfileData = z.infer<typeof PublicProfileDataSchema>
