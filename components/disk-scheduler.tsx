"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type DiskRequest, fcfsDisk, sstf, scan, cScan, look } from "@/utils/algorithms"
import { DiskVisualization } from "@/components/disk-visualization"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DiskSchedulerProps {
  algorithm: string
}

export function DiskScheduler({ algorithm }: DiskSchedulerProps) {
  const [diskSize, setDiskSize] = useState(200)
  const [initialHeadPosition, setInitialHeadPosition] = useState(50)
  const [direction, setDirection] = useState<"up" | "down">("up")
  const [requests, setRequests] = useState<DiskRequest[]>([
    { trackNumber: 82 },
    { trackNumber: 170 },
    { trackNumber: 43 },
    { trackNumber: 140 },
    { trackNumber: 24 },
    { trackNumber: 16 },
    { trackNumber: 190 },
  ])

  const [newRequest, setNewRequest] = useState<DiskRequest>({
    trackNumber: 0,
  })

  const [results, setResults] = useState<{
    order: DiskRequest[]
    totalHeadMovement: number
    averageHeadMovement: number
  } | null>(null)

  // Run simulation when algorithm changes
  useEffect(() => {
    if (requests.length > 0) {
      runSimulation()
    }
  }, [algorithm, direction])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewRequest((prev) => ({
      ...prev,
      [name]: Number(value),
    }))
  }

  const addRequest = () => {
    if (newRequest.trackNumber < 0 || newRequest.trackNumber >= diskSize) {
      alert(`Track number must be between 0 and ${diskSize - 1}`)
      return
    }

    setRequests([...requests, { ...newRequest }])
    setNewRequest({
      trackNumber: 0,
    })
  }

  const removeRequest = (index: number) => {
    setRequests(requests.filter((_, i) => i !== index))
  }

  const generateRandomRequests = () => {
    const count = 10
    const refs: DiskRequest[] = []

    for (let i = 0; i < count; i++) {
      refs.push({
        trackNumber: Math.floor(Math.random() * diskSize),
      })
    }

    setRequests(refs)
  }

  const runSimulation = () => {
    if (requests.length === 0) return

    let result

    switch (algorithm) {
      case "fcfs":
        result = fcfsDisk(requests, initialHeadPosition)
        break
      case "sstf":
        result = sstf(requests, initialHeadPosition)
        break
      case "scan":
        result = scan(requests, initialHeadPosition, diskSize, direction)
        break
      case "c-scan":
        result = cScan(requests, initialHeadPosition, diskSize)
        break
      case "look":
        result = look(requests, initialHeadPosition, direction)
        break
      default:
        result = fcfsDisk(requests, initialHeadPosition)
    }

    setResults(result)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Disk Scheduling Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diskSize">Disk Size (Tracks)</Label>
              <Input
                id="diskSize"
                type="number"
                min="10"
                max="1000"
                value={diskSize}
                onChange={(e) => setDiskSize(Number.parseInt(e.target.value, 10))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialHeadPosition">Initial Head Position</Label>
              <Input
                id="initialHeadPosition"
                type="number"
                min="0"
                max={diskSize - 1}
                value={initialHeadPosition}
                onChange={(e) => setInitialHeadPosition(Number.parseInt(e.target.value, 10))}
              />
            </div>
            {(algorithm === "scan" || algorithm === "look") && (
              <div className="space-y-2">
                <Label htmlFor="direction">Direction</Label>
                <Select value={direction} onValueChange={(value) => setDirection(value as "up" | "down")}>
                  <SelectTrigger id="direction">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Up (Increasing)</SelectItem>
                    <SelectItem value="down">Down (Decreasing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="trackNumber">Track Number</Label>
              <div className="flex gap-2">
                <Input
                  id="trackNumber"
                  name="trackNumber"
                  type="number"
                  min="0"
                  max={diskSize - 1}
                  value={newRequest.trackNumber}
                  onChange={handleInputChange}
                />
                <Button onClick={addRequest}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={generateRandomRequests}>
                <RefreshCw className="h-4 w-4 mr-1" /> Generate Random
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Track Number</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request, index) => (
                  <TableRow key={index}>
                    <TableCell>{request.trackNumber}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeRequest(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No requests added
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
          <CardTitle>Disk Scheduling Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results ? (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Total Head Movement</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{results.totalHeadMovement} tracks</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Average Head Movement</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{results.averageHeadMovement.toFixed(2)} tracks</p>
                  </CardContent>
                </Card>
              </div>

              <DiskVisualization
                requests={requests}
                orderedRequests={results.order}
                initialHeadPosition={initialHeadPosition}
                diskSize={diskSize}
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
