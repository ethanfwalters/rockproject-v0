import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Legacy in-memory database - kept as fallback if database query fails
const specimenDatabaseFallback: Record<
  string,
  {
    hardness?: string
    luster?: string
    composition?: string
    streak?: string
    type?: "mineral" | "rock" | "fossil"
  }
> = {
  // Minerals
  amethyst: {
    hardness: "7",
    luster: "Vitreous",
    composition: "SiO₂",
    streak: "White",
    type: "mineral",
  },
  quartz: {
    hardness: "7",
    luster: "Vitreous",
    composition: "SiO₂",
    streak: "White",
    type: "mineral",
  },
  pyrite: {
    hardness: "6-6.5",
    luster: "Metallic",
    composition: "FeS₂",
    streak: "Greenish-black",
    type: "mineral",
  },
  fluorite: {
    hardness: "4",
    luster: "Vitreous",
    composition: "CaF₂",
    streak: "White",
    type: "mineral",
  },
  calcite: {
    hardness: "3",
    luster: "Vitreous to resinous",
    composition: "CaCO₃",
    streak: "White",
    type: "mineral",
  },
  feldspar: {
    hardness: "6-6.5",
    luster: "Vitreous to pearly",
    composition: "KAlSi₃O₈",
    streak: "White",
    type: "mineral",
  },
  mica: {
    hardness: "2-3",
    luster: "Vitreous to pearly",
    composition: "KAl₂(AlSi₃O₁₀)(OH)₂",
    streak: "White",
    type: "mineral",
  },
  tourmaline: {
    hardness: "7-7.5",
    luster: "Vitreous",
    composition: "Complex borosilicate",
    streak: "White",
    type: "mineral",
  },
  garnet: {
    hardness: "6.5-7.5",
    luster: "Vitreous to resinous",
    composition: "X₃Y₂(SiO₄)₃",
    streak: "White",
    type: "mineral",
  },
  topaz: {
    hardness: "8",
    luster: "Vitreous",
    composition: "Al₂SiO₄(F,OH)₂",
    streak: "White",
    type: "mineral",
  },
  magnetite: {
    hardness: "5.5-6.5",
    luster: "Metallic",
    composition: "Fe₃O₄",
    streak: "Black",
    type: "mineral",
  },
  hematite: {
    hardness: "5-6",
    luster: "Metallic to earthy",
    composition: "Fe₂O₃",
    streak: "Reddish-brown",
    type: "mineral",
  },
  galena: {
    hardness: "2.5",
    luster: "Metallic",
    composition: "PbS",
    streak: "Lead gray",
    type: "mineral",
  },
  malachite: {
    hardness: "3.5-4",
    luster: "Adamantine to vitreous",
    composition: "Cu₂CO₃(OH)₂",
    streak: "Light green",
    type: "mineral",
  },
  azurite: {
    hardness: "3.5-4",
    luster: "Vitreous",
    composition: "Cu₃(CO₃)₂(OH)₂",
    streak: "Light blue",
    type: "mineral",
  },
  gypsum: {
    hardness: "2",
    luster: "Vitreous to silky",
    composition: "CaSO₄·2H₂O",
    streak: "White",
    type: "mineral",
  },
  talc: {
    hardness: "1",
    luster: "Waxy to pearly",
    composition: "Mg₃Si₄O₁₀(OH)₂",
    streak: "White",
    type: "mineral",
  },
  olivine: {
    hardness: "6.5-7",
    luster: "Vitreous",
    composition: "(Mg,Fe)₂SiO₄",
    streak: "White",
    type: "mineral",
  },
  apatite: {
    hardness: "5",
    luster: "Vitreous to subresinous",
    composition: "Ca₅(PO₄)₃(F,Cl,OH)",
    streak: "White",
    type: "mineral",
  },
  corundum: {
    hardness: "9",
    luster: "Adamantine to vitreous",
    composition: "Al₂O₃",
    streak: "White",
    type: "mineral",
  },
  diamond: {
    hardness: "10",
    luster: "Adamantine",
    composition: "C",
    streak: "None",
    type: "mineral",
  },
  ruby: {
    hardness: "9",
    luster: "Adamantine to vitreous",
    composition: "Al₂O₃",
    streak: "White",
    type: "mineral",
  },
  sapphire: {
    hardness: "9",
    luster: "Adamantine to vitreous",
    composition: "Al₂O₃",
    streak: "White",
    type: "mineral",
  },
  emerald: {
    hardness: "7.5-8",
    luster: "Vitreous",
    composition: "Be₃Al₂Si₆O₁₈",
    streak: "White",
    type: "mineral",
  },
  opal: {
    hardness: "5.5-6.5",
    luster: "Vitreous to waxy",
    composition: "SiO₂·nH₂O",
    streak: "White",
    type: "mineral",
  },
  turquoise: {
    hardness: "5-6",
    luster: "Waxy to subvitreous",
    composition: "CuAl₆(PO₄)₄(OH)₈·4H₂O",
    streak: "White to green",
    type: "mineral",
  },
  // Rocks
  granite: {
    hardness: "6-7",
    composition: "Quartz, Feldspar, Mica",
    type: "rock",
  },
  basalt: {
    hardness: "6",
    composition: "Plagioclase, Pyroxene",
    type: "rock",
  },
  marble: {
    hardness: "3-4",
    composition: "CaCO₃ (recrystallized)",
    type: "rock",
  },
  slate: {
    hardness: "3-4",
    composition: "Clay minerals, Quartz",
    type: "rock",
  },
  sandstone: {
    hardness: "6-7",
    composition: "Quartz grains, Cement",
    type: "rock",
  },
  limestone: {
    hardness: "3-4",
    composition: "CaCO₃",
    type: "rock",
  },
  obsidian: {
    hardness: "5-6",
    luster: "Vitreous",
    composition: "Volcanic glass (SiO₂)",
    type: "rock",
  },
  pumice: {
    hardness: "6",
    composition: "Volcanic glass with vesicles",
    type: "rock",
  },
  shale: {
    hardness: "3",
    composition: "Clay minerals",
    type: "rock",
  },
  gneiss: {
    hardness: "6-7",
    composition: "Feldspar, Quartz, Mica",
    type: "rock",
  },
  // Fossils
  trilobite: {
    composition: "Calcite (CaCO₃)",
    type: "fossil",
  },
  ammonite: {
    composition: "Aragonite/Calcite (CaCO₃)",
    type: "fossil",
  },
  "dinosaur bone": {
    composition: "Calcium phosphate (mineralized)",
    type: "fossil",
  },
  "petrified wood": {
    hardness: "7",
    composition: "SiO₂ (silicified)",
    type: "fossil",
  },
  "shark tooth": {
    hardness: "5",
    composition: "Fluorapatite",
    type: "fossil",
  },
  crinoid: {
    composition: "Calcite (CaCO₃)",
    type: "fossil",
  },
  brachiopod: {
    composition: "Calcite/Chitin",
    type: "fossil",
  },
  coral: {
    hardness: "3-4",
    composition: "CaCO₃",
    type: "fossil",
  },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get("name")?.toLowerCase().trim()

  if (!name) {
    return NextResponse.json({ error: "Name parameter is required" }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // First try exact match (case-insensitive)
    let { data: result } = await supabase
      .from("specimen_reference")
      .select("*")
      .ilike("name", name)
      .single()

    // If no exact match, try partial match
    if (!result) {
      const { data: partialResults } = await supabase
        .from("specimen_reference")
        .select("*")
        .or(`name.ilike.%${name}%,name.ilike.%${name.split(" ")[0]}%`)
        .limit(1)

      if (partialResults && partialResults.length > 0) {
        result = partialResults[0]
      }
    }

    if (result) {
      return NextResponse.json({
        found: true,
        data: {
          type: result.type,
          hardness: result.hardness,
          luster: result.luster,
          composition: result.composition,
          streak: result.streak,
          color: result.color,
        },
      })
    }

    // Fallback to in-memory database if not found in Supabase
    let fallbackResult = specimenDatabaseFallback[name]
    if (!fallbackResult) {
      const matchingKey = Object.keys(specimenDatabaseFallback).find(
        (key) => key.includes(name) || name.includes(key)
      )
      if (matchingKey) {
        fallbackResult = specimenDatabaseFallback[matchingKey]
      }
    }

    if (fallbackResult) {
      return NextResponse.json({
        found: true,
        data: fallbackResult,
      })
    }

    return NextResponse.json({
      found: false,
      data: null,
    })
  } catch (error) {
    console.error("Error looking up specimen:", error)

    // On error, fall back to in-memory database
    let result = specimenDatabaseFallback[name]
    if (!result) {
      const matchingKey = Object.keys(specimenDatabaseFallback).find(
        (key) => key.includes(name) || name.includes(key)
      )
      if (matchingKey) {
        result = specimenDatabaseFallback[matchingKey]
      }
    }

    if (result) {
      return NextResponse.json({
        found: true,
        data: result,
      })
    }

    return NextResponse.json({
      found: false,
      data: null,
    })
  }
}
