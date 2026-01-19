export type Mineral = {
  id: string
  name: string
  chemicalFormula?: string | null
  isVariety: boolean
  createdAt: string
}

export type CreateMineralInput = {
  name: string
  chemicalFormula?: string
  isVariety?: boolean
}
