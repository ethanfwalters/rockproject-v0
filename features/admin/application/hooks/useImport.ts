"use client"

import { useState } from "react"
import type { ImportResult } from "@/features/admin/domain/types"
import { importSpecimens } from "@/features/admin/application/client/importClient"

export function useImport() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<Record<string, string>[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      parseCSV(selectedFile)
      setResult(null)
    } else {
      alert("Please select a valid CSV file")
    }
  }

  function parseCSV(csvFile: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        alert("CSV file is empty or invalid")
        return
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim())
        const obj: Record<string, string> = {}
        headers.forEach((header, i) => {
          obj[header] = values[i] || ""
        })
        return obj
      })

      setCsvData(data)
    }
    reader.readAsText(csvFile)
  }

  async function handleImport() {
    if (csvData.length === 0) {
      alert("No data to import")
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const importResult = await importSpecimens(csvData, skipDuplicates)
      setResult(importResult)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setImporting(false)
    }
  }

  function downloadTemplate() {
    const template = `name,type,hardness,luster,composition,streak,color,crystal_system,cleavage,fracture,specific_gravity,description
quartz,mineral,7,Vitreous,SiO₂,White,Clear,Hexagonal,Poor,Conchoidal,2.65,Common mineral
granite,rock,6-7,,Quartz + Feldspar + Mica,,,,,,,Igneous rock
trilobite,fossil,,,,,,,,,,Extinct arthropod`

    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "specimen_import_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setFile(null)
    setCsvData([])
    setResult(null)
  }

  return {
    file,
    csvData,
    importing,
    result,
    skipDuplicates,
    setSkipDuplicates,
    handleFileSelect,
    handleImport,
    downloadTemplate,
    reset,
  }
}
