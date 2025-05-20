"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type PageReference, fifo, lru, optimal, clockAlgorithm } from "@/utils/algorithms"
import { PageVisualization } from "@/components/page-visualization"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw } from "lucide-react"

interface PageReplacerProps {
  algorithm: string
}

export function PageReplacer({ algorithm }: PageReplacerProps) {
  const [frameCount, setFrameCount] = useState(3)
  const [referenceString, setReferenceString] = useState("7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1")
  const [references, setReferences] = useState<PageReference[]>([
    { pageNumber: 7 },
    { pageNumber: 0 },
    { pageNumber: 1 },
    { pageNumber: 2 },
    { pageNumber: 0 },
    { pageNumber: 3 },
    { pageNumber: 0 },
    { pageNumber: 4 },
    { pageNumber: 2 },
    { pageNumber: 3 },
    { pageNumber: 0 },
    { pageNumber: 3 },
    { pageNumber: 2 },
    { pageNumber: 1 },
    { pageNumber: 2 },
    { pageNumber: 0 },
    { pageNumber: 1 },
    { pageNumber: 7 },
    { pageNumber: 0 },
    { pageNumber: 1 },
  ])

  const [results, setResults] = useState<{
    frameStates: any[][]
    hits: number
    misses: number
    hitRatio: number
  } | null>(null)

  // Run simulation when algorithm or frame count changes
  useEffect(() => {
    if (references.length > 0) {
      runSimulation()
    }
  }, [algorithm, frameCount])

  const handleReferenceStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setReferenceString(value)

    // Parse the reference string into an array of page references
    const refs = value
      .trim()
      .split(/\s+/)
      .map((num) => ({
        pageNumber: Number.parseInt(num, 10),
      }))
      .filter((ref) => !isNaN(ref.pageNumber))

    setReferences(refs)
  }

  const generateRandomReferences = () => {
    const count = 20
    const maxPage = 9
    const refs: PageReference[] = []

    for (let i = 0; i < count; i++) {
      refs.push({
        pageNumber: Math.floor(Math.random() * (maxPage + 1)),
      })
    }

    setReferences(refs)
    setReferenceString(refs.map((r) => r.pageNumber).join(" "))
  }

  const runSimulation = () => {
    if (references.length === 0) return

    let result

    switch (algorithm) {
      case "fifo":
        result = fifo(references, frameCount)
        break
      case "lru":
        result = lru(references, frameCount)
        break
      case "optimal":
        result = optimal(references, frameCount)
        break
      case "clock":
        result = clockAlgorithm(references, frameCount)
        break
      default:
        result = fifo(references, frameCount)
    }

    setResults(result)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Page Replacement Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frameCount">Number of Frames</Label>
              <Input
                id="frameCount"
                type="number"
                min="1"
                max="10"
                value={frameCount}
                onChange={(e) => setFrameCount(Number.parseInt(e.target.value, 10))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referenceString">Reference String</Label>
              <div className="flex gap-2">
                <Input
                  id="referenceString"
                  value={referenceString}
                  onChange={handleReferenceStringChange}
                  placeholder="e.g. 7 0 1 2 0 3 0 4 2 3"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateRandomReferences}
                  title="Generate Random References"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={runSimulation} className="w-full">
            Run Simulation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Page Replacement Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results ? (
            <>
              <div className="mb-6 grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Page Hits</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{results.hits}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Page Faults</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{results.misses}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Hit Ratio</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{(results.hitRatio * 100).toFixed(2)}%</p>
                  </CardContent>
                </Card>
              </div>

              <PageVisualization
                frameStates={results.frameStates}
                frameCount={frameCount}
                references={references.map((r) => r.pageNumber)}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-md">
              <p className="text-muted-foreground">Run the simulation to see results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
