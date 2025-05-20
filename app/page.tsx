"use client"

import { useState } from "react"
import { BarChart3, CpuIcon, Database, HardDrive, Layers, Lock, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"

// Import our algorithm components
import { CPUScheduler } from "@/components/cpu-scheduler"
import { MemoryManager } from "@/components/memory-manager"
import { PageReplacer } from "@/components/page-replacer"
import { DiskScheduler } from "@/components/disk-scheduler"
import { DeadlockManager } from "@/components/deadlock-manager"

// Define algorithm types
type AlgorithmCategory = "cpu" | "memory" | "page" | "disk" | "deadlock"
type AlgorithmType = string

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<AlgorithmCategory | "dashboard">("dashboard")
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("fcfs")
  const [timeQuantum, setTimeQuantum] = useState(2)

  const algorithms: Record<AlgorithmCategory, AlgorithmType[]> = {
    cpu: ["fcfs", "sjf", "rr", "priority"],
    memory: ["first-fit", "best-fit", "worst-fit"],
    page: ["fifo", "lru", "optimal", "clock"],
    disk: ["fcfs", "sstf", "scan", "c-scan", "look"],
    deadlock: ["banker", "detection", "prevention", "avoidance"],
  }

  const algorithmLabels: Record<AlgorithmType, string> = {
    fcfs: "First Come First Serve",
    sjf: "Shortest Job First",
    rr: "Round Robin",
    priority: "Priority Scheduling",
    "first-fit": "First Fit",
    "best-fit": "Best Fit",
    "worst-fit": "Worst Fit",
    fifo: "First In First Out",
    lru: "Least Recently Used",
    optimal: "Optimal",
    clock: "Clock Algorithm",
    sstf: "Shortest Seek Time First",
    scan: "SCAN",
    "c-scan": "C-SCAN",
    look: "LOOK",
    banker: "Banker's Algorithm",
    detection: "Deadlock Detection",
    prevention: "Deadlock Prevention",
    avoidance: "Deadlock Avoidance",
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "cpu", label: "CPU Scheduling", icon: CpuIcon },
    { id: "memory", label: "Memory Management", icon: Database },
    { id: "page", label: "Page Replacement", icon: Layers },
    { id: "disk", label: "Disk Scheduling", icon: HardDrive },
    { id: "deadlock", label: "Deadlock Avoidance", icon: Lock },
  ]

  const handleTabChange = (value: string) => {
    setActiveTab(value as AlgorithmCategory | "dashboard")
    if (value !== "dashboard" && value in algorithms) {
      setAlgorithm(algorithms[value as AlgorithmCategory][0])
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-16 lg:w-64 flex-col border-r bg-card">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <span className="hidden lg:block font-semibold">OS Algorithm Lab</span>
        </div>
        <nav className="grid gap-1 p-2">
          {menuItems.map((item) => (
            <TooltipProvider key={item.id} delayDuration={0}>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      className="justify-start"
                      onClick={() => handleTabChange(item.id)}
                    >
                      <item.icon className="h-4 w-4 lg:mr-2" />
                      <span className="hidden lg:block">{item.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute left-4 top-3 z-10">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-6">
            <span className="font-semibold">OS Algorithm Lab</span>
          </div>
          <nav className="grid gap-1 p-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => handleTabChange(item.id)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1">
        {/* Top navbar */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 lg:h-[60px]">
          <div className="flex flex-1 items-center md:ml-10 md:gap-4">
            <h1 className="text-xl font-semibold md:text-2xl">OS Algorithm Lab</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-full max-w-4xl overflow-x-auto">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="cpu">CPU Scheduling</TabsTrigger>
              <TabsTrigger value="memory">Memory Management</TabsTrigger>
              <TabsTrigger value="page">Page Replacement</TabsTrigger>
              <TabsTrigger value="disk">Disk Scheduling</TabsTrigger>
              <TabsTrigger value="deadlock">Deadlock</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Welcome to OS Algorithm Lab</CardTitle>
                    <CardDescription>An educational tool for operating system algorithms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-400">
                      Select a module from the sidebar to begin exploring different OS algorithms. This simulator helps
                      you understand how various operating system algorithms work.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {menuItems.slice(1).map((item) => (
                        <Button
                          key={item.id}
                          variant="outline"
                          className="h-24 flex flex-col gap-2 justify-center"
                          onClick={() => handleTabChange(item.id)}
                        >
                          <item.icon className="h-6 w-6" />
                          <span>{item.label}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>OS Algorithm Simulator</CardTitle>
                    <CardDescription>Learn about operating system concepts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md bg-[hsl(var(--muted))] p-4">
                      <h3 className="text-lg font-medium mb-2">Getting Started</h3>
                      <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                        <li>Select an algorithm module from the sidebar</li>
                        <li>Choose a specific algorithm from the dropdown</li>
                        <li>Enter the required parameters</li>
                        <li>Click "Run Simulation" to see the results</li>
                        <li>Analyze the visualization and metrics</li>
                      </ul>
                    </div>

                    <div className="rounded-md bg-[hsl(var(--muted))] p-4">
                      <h3 className="text-lg font-medium mb-2">Available Modules</h3>
                      <div className="space-y-2 text-neutral-400">
                        <p>
                          <strong>CPU Scheduling:</strong> FCFS, SJF, Round Robin, Priority
                        </p>
                        <p>
                          <strong>Memory Management:</strong> First Fit, Best Fit, Worst Fit
                        </p>
                        <p>
                          <strong>Page Replacement:</strong> FIFO, LRU, Optimal, Clock
                        </p>
                        <p>
                          <strong>Disk Scheduling:</strong> FCFS, SSTF, SCAN, C-SCAN, LOOK
                        </p>
                        <p>
                          <strong>Deadlock Avoidance:</strong> Banker's Algorithm, Detection, Prevention
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CPU Scheduling Tab */}
            <TabsContent value="cpu" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>CPU Scheduling</CardTitle>
                    <CardDescription>Simulate CPU scheduling algorithms</CardDescription>
                  </div>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithms.cpu.map((algo) => (
                        <SelectItem key={algo} value={algo}>
                          {algorithmLabels[algo as keyof typeof algorithmLabels]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {algorithm === "rr" && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Time Quantum:</span>
                        <Select
                          value={timeQuantum.toString()}
                          onValueChange={(value) => setTimeQuantum(Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Select time quantum" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((q) => (
                              <SelectItem key={q} value={q.toString()}>
                                {q}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <CPUScheduler algorithm={algorithm} timeQuantum={timeQuantum} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Memory Management Tab */}
            <TabsContent value="memory" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Memory Management</CardTitle>
                    <CardDescription>Simulate memory allocation algorithms</CardDescription>
                  </div>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithms.memory.map((algo) => (
                        <SelectItem key={algo} value={algo}>
                          {algorithmLabels[algo as keyof typeof algorithmLabels]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <MemoryManager algorithm={algorithm} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Page Replacement Tab */}
            <TabsContent value="page" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Page Replacement</CardTitle>
                    <CardDescription>Simulate page replacement algorithms</CardDescription>
                  </div>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithms.page.map((algo) => (
                        <SelectItem key={algo} value={algo}>
                          {algorithmLabels[algo as keyof typeof algorithmLabels]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <PageReplacer algorithm={algorithm} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Disk Scheduling Tab */}
            <TabsContent value="disk" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Disk Scheduling</CardTitle>
                    <CardDescription>Simulate disk scheduling algorithms</CardDescription>
                  </div>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithms.disk.map((algo) => (
                        <SelectItem key={algo} value={algo}>
                          {algorithmLabels[algo as keyof typeof algorithmLabels]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <DiskScheduler algorithm={algorithm} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deadlock Tab */}
            <TabsContent value="deadlock" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Deadlock Management</CardTitle>
                    <CardDescription>Simulate deadlock avoidance and detection algorithms</CardDescription>
                  </div>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithms.deadlock.slice(0, 2).map((algo) => (
                        <SelectItem key={algo} value={algo}>
                          {algorithmLabels[algo as keyof typeof algorithmLabels]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <DeadlockManager algorithm={algorithm} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
