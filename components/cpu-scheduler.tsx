"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type Process, fcfs, sjf, roundRobin, priorityScheduling, type GanttChartItem } from "@/utils/algorithms"
import { GanttChart } from "@/components/gantt-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"

interface CPUSchedulerProps {
  algorithm: string
  timeQuantum?: number
}

export function CPUScheduler({ algorithm, timeQuantum = 2 }: CPUSchedulerProps) {
  const [processes, setProcesses] = useState<Process[]>([
    { id: "P1", arrivalTime: 0, burstTime: 5 },
    { id: "P2", arrivalTime: 1, burstTime: 4 },
    { id: "P3", arrivalTime: 2, burstTime: 3 },
    { id: "P4", arrivalTime: 3, burstTime: 2 },
  ])

  const [newProcess, setNewProcess] = useState<Process>({
    id: "",
    arrivalTime: 0,
    burstTime: 1,
    priority: 1,
  })

  const [results, setResults] = useState<{
    schedule: GanttChartItem[]
    metrics: Process[]
    averageWaitingTime: number
    averageTurnaroundTime: number
  } | null>(null)

  // Run simulation when algorithm changes
  useEffect(() => {
    if (processes.length > 0) {
      runSimulation()
    }
  }, [algorithm, timeQuantum])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProcess((prev) => ({
      ...prev,
      [name]: name === "id" ? value : Number(value),
    }))
  }

  const addProcess = () => {
    if (!newProcess.id.trim()) {
      alert("Process ID is required")
      return
    }

    // Check if process ID already exists
    if (processes.some((p) => p.id === newProcess.id)) {
      alert("Process ID already exists")
      return
    }

    // Validate burst time
    if (newProcess.burstTime <= 0) {
      alert("Burst time must be greater than 0")
      return
    }

    // Validate arrival time
    if (newProcess.arrivalTime < 0) {
      alert("Arrival time cannot be negative")
      return
    }

    setProcesses([...processes, { ...newProcess }])
    setNewProcess({
      id: "",
      arrivalTime: 0,
      burstTime: 1,
      priority: 1,
    })
  }

  const removeProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id))
  }

  const runSimulation = () => {
    if (processes.length === 0) {
      alert("Please add at least one process")
      return
    }

    let result

    switch (algorithm) {
      case "fcfs":
        result = fcfs(processes)
        break
      case "sjf":
        result = sjf(processes)
        break
      case "rr":
        result = roundRobin(processes, timeQuantum)
        break
      case "priority":
        result = priorityScheduling(processes)
        break
      default:
        result = fcfs(processes)
    }

    setResults(result)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Process List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-1">
                <Label htmlFor="id">ID</Label>
                <Input id="id" name="id" value={newProcess.id} onChange={handleInputChange} placeholder="P5" />
              </div>
              <div className="col-span-1">
                <Label htmlFor="arrivalTime">Arrival</Label>
                <Input
                  id="arrivalTime"
                  name="arrivalTime"
                  type="number"
                  min="0"
                  value={newProcess.arrivalTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="burstTime">Burst</Label>
                <Input
                  id="burstTime"
                  name="burstTime"
                  type="number"
                  min="1"
                  value={newProcess.burstTime}
                  onChange={handleInputChange}
                />
              </div>
              {algorithm === "priority" && (
                <div className="col-span-1">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    name="priority"
                    type="number"
                    min="1"
                    value={newProcess.priority}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className={`col-span-${algorithm === "priority" ? "1" : "2"} flex items-end`}>
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
                    <TableHead>Arrival</TableHead>
                    <TableHead>Burst</TableHead>
                    {algorithm === "priority" && <TableHead>Priority</TableHead>}
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processes.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">{process.id}</TableCell>
                      <TableCell>{process.arrivalTime}</TableCell>
                      <TableCell>{process.burstTime}</TableCell>
                      {algorithm === "priority" && <TableCell>{process.priority}</TableCell>}
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeProcess(process.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {processes.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={algorithm === "priority" ? 5 : 4}
                        className="text-center text-muted-foreground"
                      >
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
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {results ? (
            <>
              <div>
                <h3 className="text-lg font-medium mb-2">Gantt Chart</h3>
                <GanttChart schedule={results.schedule} />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Process Metrics</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Process ID</TableHead>
                      <TableHead>Arrival Time</TableHead>
                      <TableHead>Burst Time</TableHead>
                      <TableHead>Waiting Time</TableHead>
                      <TableHead>Turnaround Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.metrics.map((process) => (
                      <TableRow key={process.id}>
                        <TableCell className="font-medium">{process.id}</TableCell>
                        <TableCell>{process.arrivalTime}</TableCell>
                        <TableCell>{process.burstTime}</TableCell>
                        <TableCell>{process.waitingTime}</TableCell>
                        <TableCell>{process.turnaroundTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Average Waiting Time</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{results.averageWaitingTime.toFixed(2)} ms</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Average Turnaround Time</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{results.averageTurnaroundTime.toFixed(2)} ms</p>
                  </CardContent>
                </Card>
              </div>
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
