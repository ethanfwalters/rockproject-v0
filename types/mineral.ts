export type Mineral = {
  id: string
  name: string
  chemicalFormula?: string | null
  isVariety: boolean
  varietyOf?: string | null
  varietyOfMineral?: { id: string; name: string } | null
  varieties?: Array<{ id: string; name: string }>
  createdAt: string
}

export type CreateMineralInput = {
  name: string
  chemicalFormula?: string
  isVariety?: boolean
  varietyOf?: string
}
