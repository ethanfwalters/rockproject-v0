export type Mineral = {
  id: string
  name: string
  chemicalFormula?: string | null
  createdAt: string
}

export type CreateMineralInput = {
  name: string
  chemicalFormula?: string
}
