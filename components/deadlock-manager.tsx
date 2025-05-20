"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type DeadlockProcess, type ResourceType, bankersAlgorithm, deadlockDetection } from "@/utils/algorithms"
import { DeadlockVisualization } from "@/components/deadlock-visualization"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"

interface DeadlockManagerProps {
  algorithm: string
}

export function DeadlockManager({ algorithm }: DeadlockManagerProps) {
  const [resources, setResources] = useState<ResourceType[]>([
    { id: 1, total: 10, available: 3 },
    { id: 2, total: 5, available: 2 },
    { id: 3, total: 7, available: 2 },
  ])

  const [processes, setProcesses] = useState<DeadlockProcess[]>([
    { id: "P1", allocation: [0, 1, 0], max: [7, 5, 3], request: [7, 4, 3] },
    { id: "P2", allocation: [2, 0, 0], max: [3, 2, 2], request: [1, 2, 2] },
    { id: "P3", allocation: [3, 0, 2], max: [9, 0, 2], request: [6, 0, 0] },
    { id: "P4", allocation: [2, 1, 1], max: [2, 2, 2], request: [0, 1, 1] },
    { id: "P5", allocation: [0, 0, 2], max: [4, 3, 3], request: [4, 3, 1] },
  ])

  const [newResource, setNewResource] = useState<ResourceType>({
    id: 0,
    total: 10,
    available: 5,
  })

  const [newProcess, setNewProcess] = useState<DeadlockProcess>({
    id: "",
    allocation: [0, 0, 0],
    max: [0, 0, 0],
    request: [0, 0, 0],
  })

  const [results, setResults] = useState<any>(null)

  // Run simulation when algorithm changes
  useEffect(() => {
    if (resources.length > 0 && processes.length > 0) {
      runSimulation()
    }
  }, [algorithm])

  // Update new process when resources change
  useEffect(() => {
    setNewProcess((prev) => ({
      ...prev,
      allocation: Array(resources.length).fill(0),
      max: Array(resources.length).fill(0),
      request: Array(resources.length).fill(0),
    }))
  }, [resources.length])

  const handleResourceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewResource((prev) => ({
      ...prev,
      [name]: Number(value),
    }))
  }

  const handleProcessIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setNewProcess((prev) => ({
      ...prev,
      id: value,
    }))
  }

  const handleAllocationChange = (index: number, value: number) => {
    const newAllocation = [...newProcess.allocation]
    newAllocation[index] = value

    // Calculate request based on max - allocation
    const newRequest = newProcess.max.map((max, i) => max - (i === index ? value : newProcess.allocation[i]))

    setNewProcess((prev) => ({
      ...prev,
      allocation: newAllocation,
      request: newRequest,
    }))
  }

  const handleMaxChange = (index: number, value: number) => {
    const newMax = [...newProcess.max]
    newMax[index] = value

    // Calculate request based on max - allocation
    const newRequest = newMax.map((max, i) => max - newProcess.allocation[i])

    setNewProcess((prev) => ({
      ...prev,
      max: newMax,
      request: newRequest,
    }))
  }

  const addResource = () => {
    if (newResource.id === 0) {
      // Auto-generate ID if not provided
      const maxId = Math.max(0, ...resources.map((r) => r.id))
      newResource.id = maxId + 1
    }

    // Check if resource ID already exists
    if (resources.some((r) => r.id === newResource.id)) {
      alert("Resource ID already exists")
      return
    }

    // Validate available <= total
    if (newResource.available > newResource.total) {
      alert("Available resources cannot exceed total resources")
      return
    }

    setResources([...resources, { ...newResource }])

    // Update all processes to include the new resource
    setProcesses(
      processes.map((process) => ({
        ...process,
        allocation: [...process.allocation, 0],
        max: [...process.max, 0],
        request: [...process.request, 0],
      })),
    )

    setNewResource({
      id: 0,
      total: 10,
      available: 5,
    })
  }

  const addProcess = () => {
    if (!newProcess.id) return

    // Check if process ID already exists
    if (processes.some((p) => p.id === newProcess.id)) {
      alert("Process ID already exists")
      return
    }

    // Validate allocation <= max
    for (let i = 0; i < resources.length; i++) {
      if (newProcess.allocation[i] > newProcess.max[i]) {
        alert(`Allocation for resource ${resources[i].id} cannot exceed maximum need`)
        return
      }
    }

    // Validate allocation <= total
    for (let i = 0; i < resources.length; i++) {
      const totalAllocated = processes.reduce((sum, p) => sum + p.allocation[i], 0) + newProcess.allocation[i]
      if (totalAllocated > resources[i].total) {
        alert(`Total allocation for resource ${resources[i].id} exceeds total available`)
        return
      }
    }

    setProcesses([...processes, { ...newProcess }])
    setNewProcess({
      id: "",
      allocation: Array(resources.length).fill(0),
      max: Array(resources.length).fill(0),
      request: Array(resources.length).fill(0),
    })
  }

  const removeResource = (id: number) => {
    setResources(resources.filter((r) => r.id !== id))

    // Update all processes to remove the resource
    const resourceIndex = resources.findIndex((r) => r.id === id)
    if (resourceIndex !== -1) {
      setProcesses(
        processes.map((process) => ({
          ...process,
          allocation: process.allocation.filter((_, i) => i !== resourceIndex),
          max: process.max.filter((_, i) => i !== resourceIndex),
          request: process.request.filter((_, i) => i !== resourceIndex),
        })),
      )
    }
  }

  const removeProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id))
  }

  const runSimulation = () => {
    if (resources.length === 0 || processes.length === 0) return

    let result

    switch (algorithm) {
      case "banker":
        result = bankersAlgorithm(processes, resources)
        break
      case "detection":
        result = deadlockDetection(processes, resources)
        break
      default:
        result = bankersAlgorithm(processes, resources)
    }

    setResults(result)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label htmlFor="resourceId">Resource ID</Label>
              <Input
                id="resourceId"
                name="id"
                type="number"
                min="1"
                value={newResource.id || ""}
                onChange={handleResourceInputChange}
                placeholder="Auto"
              />
            </div>
            <div>
              <Label htmlFor="total">Total Units</Label>
              <Input
                id="total"
                name="total"
                type="number"
                min="1"
                value={newResource.total}
                onChange={handleResourceInputChange}
              />
            </div>
            <div>
              <Label htmlFor="available">Available Units</Label>
              <Input
                id="available"
                name="available"
                type="number"
                min="0"
                max={newResource.total}
                value={newResource.available}
                onChange={handleResourceInputChange}
              />
            </div>
          </div>

          <Button onClick={addResource} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add Resource
          </Button>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>{resource.id}</TableCell>
                    <TableCell>{resource.total}</TableCell>
                    <TableCell>{resource.available}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeResource(resource.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {resources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No resources added
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
          <div className="space-y-2">
            <Label htmlFor="processId">Process ID</Label>
            <Input id="processId" value={newProcess.id} onChange={handleProcessIdChange} placeholder="P6" />
          </div>

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Resource Allocation</h3>
            <div className="grid grid-cols-3 gap-4">
              {resources.map((resource, index) => (
                <div key={resource.id}>
                  <Label>Resource {resource.id}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <Label className="text-xs">Allocation</Label>
                      <Input
                        type="number"
                        min="0"
                        max={resource.total}
                        value={newProcess.allocation[index] || 0}
                        onChange={(e) => handleAllocationChange(index, Number.parseInt(e.target.value, 10))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Need</Label>
                      <Input
                        type="number"
                        min="0"
                        max={resource.total}
                        value={newProcess.max[index] || 0}
                        onChange={(e) => handleMaxChange(index, Number.parseInt(e.target.value, 10))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={addProcess} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add Process
          </Button>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Process</TableHead>
                  {resources.map((resource) => (
                    <TableHead key={resource.id}>Resource {resource.id}</TableHead>
                  ))}
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.id}</TableCell>
                    {resources.map((_, index) => (
                      <TableCell key={index}>
                        <div className="text-xs">
                          <div>Alloc: {process.allocation[index]}</div>
                          <div>Max: {process.max[index]}</div>
                          <div>Need: {process.request[index]}</div>
                        </div>
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeProcess(process.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {processes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={resources.length + 2} className="text-center text-muted-foreground">
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

      <Card>
        <CardHeader>
          <CardTitle>Deadlock Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results ? (
            <DeadlockVisualization
              processes={
                algorithm === "banker"
                  ? results.processStates[results.processStates.length - 1]
                  : results.processStates[results.processStates.length - 1]
              }
              resources={resources}
              isSafe={algorithm === "banker" ? results.isSafe : undefined}
              safeSequence={algorithm === "banker" ? results.safeSequence : undefined}
              hasDeadlock={algorithm === "detection" ? results.hasDeadlock : undefined}
              deadlockedProcesses={algorithm === "detection" ? results.deadlockedProcesses : undefined}
            />
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
