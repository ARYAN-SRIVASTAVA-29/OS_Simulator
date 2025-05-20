"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type MemoryBlock, type MemoryProcess, firstFit, bestFit, worstFit } from "@/utils/algorithms"
import { MemoryVisualization } from "@/components/memory-visualization"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"

interface MemoryManagerProps {
  algorithm: string
}

export function MemoryManager({ algorithm }: MemoryManagerProps) {
  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([
    { id: 1, size: 100 },
    { id: 2, size: 500 },
    { id: 3, size: 200 },
    { id: 4, size: 300 },
    { id: 5, size: 600 },
  ])

  const [processes, setProcesses] = useState<MemoryProcess[]>([
    { id: "P1", size: 212 },
    { id: "P2", size: 417 },
    { id: "P3", size: 112 },
    { id: "P4", size: 426 },
  ])

  const [newBlock, setNewBlock] = useState<MemoryBlock>({
    id: 0,
    size: 100,
  })

  const [newProcess, setNewProcess] = useState<MemoryProcess>({
    id: "",
    size: 100,
  })

  const [results, setResults] = useState<{
    blocks: MemoryBlock[]
    processes: MemoryProcess[]
    successfulAllocations: number
    totalFragmentation: number
  } | null>(null)

  // Run simulation when algorithm changes
  useEffect(() => {
    if (memoryBlocks.length > 0 && processes.length > 0) {
      runSimulation()
    }
  }, [algorithm])

  const handleBlockInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewBlock((prev) => ({
      ...prev,
      [name]: name === "id" ? Number(value) : Number(value),
    }))
  }

  const handleProcessInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProcess((prev) => ({
      ...prev,
      [name]: name === "id" ? value : Number(value),
    }))
  }

  const addBlock = () => {
    if (newBlock.id === 0) {
      // Auto-generate ID if not provided
      const maxId = Math.max(0, ...memoryBlocks.map((b) => b.id))
      newBlock.id = maxId + 1
    }

    // Check if block ID already exists
    if (memoryBlocks.some((b) => b.id === newBlock.id)) {
      alert("Block ID already exists")
      return
    }

    setMemoryBlocks([...memoryBlocks, { ...newBlock }])
    setNewBlock({
      id: 0,
      size: 100,
    })
  }

  const addProcess = () => {
    if (!newProcess.id) return

    // Check if process ID already exists
    if (processes.some((p) => p.id === newProcess.id)) {
      alert("Process ID already exists")
      return
    }

    setProcesses([...processes, { ...newProcess }])
    setNewProcess({
      id: "",
      size: 100,
    })
  }

  const removeBlock = (id: number) => {
    setMemoryBlocks(memoryBlocks.filter((b) => b.id !== id))
  }

  const removeProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id))
  }

  const runSimulation = () => {
    if (memoryBlocks.length === 0 || processes.length === 0) return

    let result

    switch (algorithm) {
      case "first-fit":
        result = firstFit(memoryBlocks, processes)
        break
      case "best-fit":
        result = bestFit(memoryBlocks, processes)
        break
      case "worst-fit":
        result = worstFit(memoryBlocks, processes)
        break
      default:
        result = firstFit(memoryBlocks, processes)
    }

    setResults(result)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Memory Blocks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <Label htmlFor="blockId">Block ID</Label>
              <Input
                id="blockId"
                name="id"
                type="number"
                min="1"
                value={newBlock.id || ""}
                onChange={handleBlockInputChange}
                placeholder="Auto"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="blockSize">Size (KB)</Label>
              <Input
                id="blockSize"
                name="size"
                type="number"
                min="1"
                value={newBlock.size}
                onChange={handleBlockInputChange}
              />
            </div>
            <div className="col-span-1 flex items-end">
              <Button onClick={addBlock} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Size (KB)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memoryBlocks.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell>{block.id}</TableCell>
                    <TableCell>{block.size}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeBlock(block.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {memoryBlocks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No memory blocks added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <Label htmlFor="processId">Process ID</Label>
              <Input
                id="processId"
                name="id"
                value={newProcess.id}
                onChange={handleProcessInputChange}
                placeholder="P5"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="processSize">Size (KB)</Label>
              <Input
                id="processSize"
                name="size"
                type="number"
                min="1"
                value={newProcess.size}
                onChange={handleProcessInputChange}
              />
            </div>
            <div className="col-span-1 flex items-end">
              <Button onClick={addProcess} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Size (KB)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.id}</TableCell>
                    <TableCell>{process.size}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeProcess(process.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {processes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No processes added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Button onClick={runSimulation} className="w-full">
            Run Simulation
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Memory Allocation Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results ? (
            <>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Successful Allocations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">
                      {results.successfulAllocations} / {processes.length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Total Internal Fragmentation</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{results.totalFragmentation} KB</p>
                  </CardContent>
                </Card>
              </div>

              <MemoryVisualization blocks={results.blocks} processes={results.processes} />
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
