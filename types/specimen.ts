export type Specimen = {
  id: string
  name: string
  type: "rock" | "mineral" | "fossil"
  imageUrl?: string
  dateAdded: string
  location?: string
  description?: string
  coordinates?: {
    lat: number
    lng: number
  }
  tags?: string[]
  details?: {
    hardness?: string
    composition?: string
    age?: string
    weight?: string
    dimensions?: string
    color?: string
    luster?: string
    streak?: string
  }
}
