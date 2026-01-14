export type Locality = {
  id: string
  name: string
  latitude?: number
  longitude?: number
  kind: string
  parentId?: string
  createdAt: string
}

export type LocalityWithAncestors = Locality & {
  ancestors: Locality[] // From immediate parent to root (country)
  fullPath: string // "Mine Name, District, State, Country"
}

export type LocalityTree = Locality & {
  children: LocalityTree[]
}

export type CreateLocalityInput = {
  name: string
  latitude?: number
  longitude?: number
  kind: string
  parentId?: string
}
