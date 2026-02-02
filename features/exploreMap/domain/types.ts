import { z } from "zod"

export const PublicMapLocalitySchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
})

export type PublicMapLocality = z.infer<typeof PublicMapLocalitySchema>

export const PublicMapSpecimenSchema = z.object({
  id: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  mineralNames: z.array(z.string()),
  addedBy: z.string(),
  locality: PublicMapLocalitySchema,
})

export type PublicMapSpecimen = z.infer<typeof PublicMapSpecimenSchema>
