import { z } from "zod"

export const ProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  username: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Profile = z.infer<typeof ProfileSchema>

export const UsernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
