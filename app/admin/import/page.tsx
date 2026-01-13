"use client"

import { useState } from "react"
import { Button } from "@/features/shared/presentation/button"
import { Card } from "@/features/shared/presentation/card"
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface ImportResult {
  total: number
  imported: number
  skipped: number
  errors: Array<{ row: number; name: string; error: string }>
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
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

  function parseCSV(file: File) {
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
        const obj: any = {}
        headers.forEach((header, i) => {
          obj[header] = values[i] || ""
        })
        return obj
      })

      setCsvData(data)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (csvData.length === 0) {
      alert("No data to import")
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specimens: csvData,
          skipDuplicates,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to import specimens")
      }

      setResult(data.results)
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

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Import Specimens</h1>
        <p className="text-muted-foreground mt-2">Import multiple specimens from a CSV file</p>
      </div>

      {/* Instructions */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">How to Import</h2>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Download the CSV template below and fill in your specimen data</li>
          <li>Required columns: <code className="bg-muted px-1 py-0.5 rounded">name</code>, <code className="bg-muted px-1 py-0.5 rounded">type</code></li>
          <li>Optional columns: hardness, luster, composition, streak, color, crystal_system, cleavage, fracture, specific_gravity, description</li>
          <li>Upload your completed CSV file</li>
          <li>Review the preview and import</li>
        </ol>
        <Button onClick={downloadTemplate} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download CSV Template
        </Button>
      </Card>

      {/* File Upload */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              {file ? (
                <>
                  <FileText className="h-12 w-12 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {csvData.length} rows ready to import
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => document.getElementById("csv-upload")?.click()}>
                    Choose Different File
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drop CSV file here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-1">Accepts .csv files only</p>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>

        {csvData.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skip-duplicates"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="skip-duplicates" className="text-sm cursor-pointer">
                Skip duplicate specimens (recommended)
              </label>
            </div>

            <Button onClick={handleImport} disabled={importing} className="w-full gap-2">
              <Upload className="h-4 w-4" />
              {importing ? "Importing..." : `Import ${csvData.length} Specimens`}
            </Button>
          </div>
        )}
      </Card>

      {/* Preview */}
      {csvData.length > 0 && !result && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preview (First 5 Rows)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Hardness</th>
                  <th className="px-4 py-2 text-left">Composition</th>
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-2 capitalize">{row.name || "-"}</td>
                    <td className="px-4 py-2 capitalize">{row.type || "-"}</td>
                    <td className="px-4 py-2">{row.hardness || "-"}</td>
                    <td className="px-4 py-2">{row.composition || "-"}</td>
                  </tr>
                ))}
                {csvData.length > 5 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-muted-foreground">
                      ... and {csvData.length - 5} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Import Results</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{result.imported}</p>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{result.skipped}</p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{result.errors.length}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-destructive">Errors:</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {result.errors.map((err, i) => (
                  <div key={i} className="text-sm p-3 bg-destructive/10 rounded-md">
                    <p className="font-medium">Row {err.row}: {err.name}</p>
                    <p className="text-muted-foreground">{err.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.imported > 0 && (
            <div className="bg-green-500/10 text-green-700 dark:text-green-400 p-4 rounded-md">
              Successfully imported {result.imported} specimen{result.imported !== 1 ? "s" : ""} into the database!
            </div>
          )}

          <Button onClick={() => {
            setFile(null)
            setCsvData([])
            setResult(null)
          }} className="w-full">
            Import Another File
          </Button>
        </Card>
      )}
    </div>
  )
}
