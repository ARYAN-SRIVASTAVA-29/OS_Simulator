export interface Process {
  id: string
  arrivalTime: number
  burstTime: number
  priority?: number
  remainingTime?: number
  startTime?: number
  finishTime?: number
  waitingTime?: number
  turnaroundTime?: number
  color?: string
}

export interface GanttChartItem {
  id: string
  start: number
  end: number
  color: string
}

// First Come First Serve (FCFS)
export function fcfs(processes: Process[]): {
  schedule: GanttChartItem[]
  metrics: Process[]
  averageWaitingTime: number
  averageTurnaroundTime: number
} {
  // Sort processes by arrival time
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime)
  const resultProcesses: Process[] = []
  const schedule: GanttChartItem[] = []

  let currentTime = 0
  let totalWaitingTime = 0
  let totalTurnaroundTime = 0

  // Assign colors to processes
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  sortedProcesses.forEach((process, index) => {
    const color = colors[index % colors.length]

    // If there's a gap between current time and next arrival
    if (process.arrivalTime > currentTime) {
      currentTime = process.arrivalTime
    }

    const startTime = currentTime
    const finishTime = currentTime + process.burstTime
    const waitingTime = startTime - process.arrivalTime
    const turnaroundTime = finishTime - process.arrivalTime

    // Update schedule
    schedule.push({
      id: process.id,
      start: startTime,
      end: finishTime,
      color,
    })

    // Update metrics
    resultProcesses.push({
      ...process,
      startTime,
      finishTime,
      waitingTime,
      turnaroundTime,
      color,
    })

    // Update current time and totals
    currentTime = finishTime
    totalWaitingTime += waitingTime
    totalTurnaroundTime += turnaroundTime
  })

  return {
    schedule,
    metrics: resultProcesses,
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
  }
}

// Shortest Job First (SJF)
export function sjf(processes: Process[]): {
  schedule: GanttChartItem[]
  metrics: Process[]
  averageWaitingTime: number
  averageTurnaroundTime: number
} {
  const processQueue = [...processes]
  const resultProcesses: Process[] = []
  const schedule: GanttChartItem[] = []

  let currentTime = 0
  let totalWaitingTime = 0
  let totalTurnaroundTime = 0

  // Assign colors to processes
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  // Create a map for easy lookup and color assignment
  const processMap = new Map<string, Process & { color: string }>()
  processes.forEach((process, index) => {
    processMap.set(process.id, {
      ...process,
      color: colors[index % colors.length],
    })
  })

  while (processQueue.length > 0) {
    // Find processes that have arrived by the current time
    const availableProcesses = processQueue.filter((p) => p.arrivalTime <= currentTime)

    if (availableProcesses.length === 0) {
      // No processes available, advance time to next arrival
      const nextArrival = Math.min(...processQueue.map((p) => p.arrivalTime))
      currentTime = nextArrival
      continue
    }

    // Select the process with the shortest burst time
    const shortestJobIndex = availableProcesses.reduce(
      (minIndex, process, currentIndex, arr) => (process.burstTime < arr[minIndex].burstTime ? currentIndex : minIndex),
      0,
    )

    const selectedProcess = availableProcesses[shortestJobIndex]
    const processIndex = processQueue.findIndex((p) => p.id === selectedProcess.id)
    const startTime = currentTime
    const finishTime = currentTime + selectedProcess.burstTime
    const waitingTime = startTime - selectedProcess.arrivalTime
    const turnaroundTime = finishTime - selectedProcess.arrivalTime
    const color = processMap.get(selectedProcess.id)?.color || "bg-gray-500"

    // Update schedule
    schedule.push({
      id: selectedProcess.id,
      start: startTime,
      end: finishTime,
      color,
    })

    // Update metrics
    resultProcesses.push({
      ...selectedProcess,
      startTime,
      finishTime,
      waitingTime,
      turnaroundTime,
      color,
    })

    // Remove the processed job from the queue
    processQueue.splice(processIndex, 1)

    // Update current time and totals
    currentTime = finishTime
    totalWaitingTime += waitingTime
    totalTurnaroundTime += turnaroundTime
  }

  return {
    schedule,
    metrics: resultProcesses,
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
  }
}

// Round Robin (RR)
export function roundRobin(
  processes: Process[],
  timeQuantum: number,
): {
  schedule: GanttChartItem[]
  metrics: Process[]
  averageWaitingTime: number
  averageTurnaroundTime: number
} {
  // Create a deep copy of the processes
  const processQueue = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
    waitingTime: 0,
    turnaroundTime: 0,
    startTime: -1,
    finishTime: -1,
  }))

  const resultProcesses: Process[] = processes.map((p) => ({ ...p }))
  const schedule: GanttChartItem[] = []

  let currentTime = 0
  let completed = 0

  // Assign colors to processes
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  // Create a map for colors
  const processColors = new Map<string, string>()
  processes.forEach((process, index) => {
    processColors.set(process.id, colors[index % colors.length])
  })

  // Sort the queue initially by arrival time
  processQueue.sort((a, b) => a.arrivalTime - b.arrivalTime)

  // Queue for ready processes
  const readyQueue: Process[] = []

  // If the first process has arrival time > 0, advance time
  if (processQueue.length > 0 && processQueue[0].arrivalTime > 0) {
    currentTime = processQueue[0].arrivalTime
  }

  while (completed < processes.length) {
    // Add newly arrived processes to the ready queue
    let i = 0
    while (i < processQueue.length) {
      if (processQueue[i].arrivalTime <= currentTime && processQueue[i].remainingTime! > 0) {
        readyQueue.push(processQueue.splice(i, 1)[0])
      } else {
        i++
      }
    }

    if (readyQueue.length === 0) {
      // No processes in ready queue, advance time to next arrival
      if (processQueue.length > 0) {
        currentTime = processQueue[0].arrivalTime
        continue
      } else {
        break // No more processes
      }
    }

    // Get the next process from the ready queue
    const currentProcess = readyQueue.shift()!

    // If this is the first time the process is running, set the start time
    const processResult = resultProcesses.find((p) => p.id === currentProcess.id)!
    if (processResult.startTime === undefined || processResult.startTime < 0) {
      processResult.startTime = currentTime
    }

    // Calculate execution time in this round
    const executeTime = Math.min(timeQuantum, currentProcess.remainingTime!)

    // Update schedule
    schedule.push({
      id: currentProcess.id,
      start: currentTime,
      end: currentTime + executeTime,
      color: processColors.get(currentProcess.id) || "bg-gray-500",
    })

    // Update process remaining time
    currentProcess.remainingTime! -= executeTime
    currentTime += executeTime

    // Check if the process has completed
    if (currentProcess.remainingTime! <= 0) {
      completed++

      // Update metrics for the completed process
      processResult.finishTime = currentTime
      processResult.turnaroundTime = processResult.finishTime - processResult.arrivalTime
      processResult.waitingTime = processResult.turnaroundTime - processResult.burstTime
      processResult.color = processColors.get(currentProcess.id)
    } else {
      // Add newly arrived processes before re-adding the current process
      i = 0
      while (i < processQueue.length) {
        if (processQueue[i].arrivalTime <= currentTime) {
          readyQueue.push(processQueue.splice(i, 1)[0])
        } else {
          i++
        }
      }

      // Re-add the current process to the ready queue
      readyQueue.push(currentProcess)
    }
  }

  // Calculate averages
  const totalWaitingTime = resultProcesses.reduce((sum, p) => sum + (p.waitingTime || 0), 0)
  const totalTurnaroundTime = resultProcesses.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0)

  return {
    schedule,
    metrics: resultProcesses,
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
  }
}

// Priority Scheduling
export function priorityScheduling(processes: Process[]): {
  schedule: GanttChartItem[]
  metrics: Process[]
  averageWaitingTime: number
  averageTurnaroundTime: number
} {
  const processQueue = [...processes]
  const resultProcesses: Process[] = []
  const schedule: GanttChartItem[] = []

  let currentTime = 0
  let totalWaitingTime = 0
  let totalTurnaroundTime = 0

  // Assign colors to processes
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  const processMap = new Map<string, Process & { color: string }>()
  processes.forEach((process, index) => {
    processMap.set(process.id, {
      ...process,
      color: colors[index % colors.length],
    })
  })

  while (processQueue.length > 0) {
    // Find processes that have arrived by the current time
    const availableProcesses = processQueue.filter((p) => p.arrivalTime <= currentTime)

    if (availableProcesses.length === 0) {
      // No processes available, advance time to next arrival
      const nextArrival = Math.min(...processQueue.map((p) => p.arrivalTime))
      currentTime = nextArrival
      continue
    }

    // Select the process with the highest priority (lower number = higher priority)
    const highestPriorityIndex = availableProcesses.reduce(
      (minIndex, process, currentIndex, arr) =>
        (process.priority || Number.POSITIVE_INFINITY) < (arr[minIndex].priority || Number.POSITIVE_INFINITY)
          ? currentIndex
          : minIndex,
      0,
    )

    const selectedProcess = availableProcesses[highestPriorityIndex]
    const processIndex = processQueue.findIndex((p) => p.id === selectedProcess.id)
    const startTime = currentTime
    const finishTime = currentTime + selectedProcess.burstTime
    const waitingTime = startTime - selectedProcess.arrivalTime
    const turnaroundTime = finishTime - selectedProcess.arrivalTime
    const color = processMap.get(selectedProcess.id)?.color || "bg-gray-500"

    // Update schedule
    schedule.push({
      id: selectedProcess.id,
      start: startTime,
      end: finishTime,
      color,
    })

    // Update metrics
    resultProcesses.push({
      ...selectedProcess,
      startTime,
      finishTime,
      waitingTime,
      turnaroundTime,
      color,
    })

    // Remove the processed job from the queue
    processQueue.splice(processIndex, 1)

    // Update current time and totals
    currentTime = finishTime
    totalWaitingTime += waitingTime
    totalTurnaroundTime += turnaroundTime
  }

  return {
    schedule,
    metrics: resultProcesses,
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
  }
}

// Memory Management Algorithms
export interface MemoryBlock {
  id: number
  size: number
  allocated?: boolean
  processId?: string
  fragmentation?: number
}

export interface MemoryProcess {
  id: string
  size: number
  blockId?: number
  allocated?: boolean
  color?: string
}

export interface MemoryAllocationResult {
  blocks: MemoryBlock[]
  processes: MemoryProcess[]
  successfulAllocations: number
  totalFragmentation: number
}

// First Fit Algorithm
export function firstFit(blocks: MemoryBlock[], processes: MemoryProcess[]): MemoryAllocationResult {
  const resultBlocks = [...blocks].map((block) => ({
    ...block,
    allocated: false,
    processId: undefined,
    fragmentation: 0,
  }))
  const resultProcesses = [...processes].map((process) => ({ ...process, allocated: false, blockId: undefined }))

  // Assign colors to processes
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  resultProcesses.forEach((process, index) => {
    process.color = colors[index % colors.length]
  })

  let successfulAllocations = 0
  let totalFragmentation = 0

  for (let i = 0; i < resultProcesses.length; i++) {
    const process = resultProcesses[i]

    for (let j = 0; j < resultBlocks.length; j++) {
      const block = resultBlocks[j]

      if (!block.allocated && block.size >= process.size) {
        // Allocate process to this block
        block.allocated = true
        // block.processId = process.id
        block.fragmentation = block.size - process.size

        process.allocated = true
        // process.blockId = block.id

        successfulAllocations++
        totalFragmentation += block.fragmentation
        break
      }
    }
  }

  return {
    blocks: resultBlocks,
    processes: resultProcesses,
    successfulAllocations,
    totalFragmentation,
  }
}

// Best Fit Algorithm
export function bestFit(blocks: MemoryBlock[], processes: MemoryProcess[]): MemoryAllocationResult {
  const resultBlocks = [...blocks].map((block) => ({
    ...block,
    allocated: false,
    processId: undefined,
    fragmentation: 0,
  }))
  const resultProcesses = [...processes].map((process) => ({ ...process, allocated: false, blockId: undefined }))

  // Assign colors to processes
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  resultProcesses.forEach((process, index) => {
    process.color = colors[index % colors.length]
  })

  let successfulAllocations = 0
  let totalFragmentation = 0

  for (let i = 0; i < resultProcesses.length; i++) {
    const process = resultProcesses[i]
    let bestBlockIndex = -1
    let bestBlockSize = Number.POSITIVE_INFINITY

    for (let j = 0; j < resultBlocks.length; j++) {
      const block = resultBlocks[j]

      if (!block.allocated && block.size >= process.size) {
        if (block.size < bestBlockSize) {
          bestBlockIndex = j
          bestBlockSize = block.size
        }
      }
    }

    if (bestBlockIndex !== -1) {
      // Allocate process to the best fit block
      const block = resultBlocks[bestBlockIndex]
      block.allocated = true
      // block.processId = process.id
      block.fragmentation = block.size - process.size

      process.allocated = true
      // process.blockId = block.id

      successfulAllocations++
      totalFragmentation += block.fragmentation
    }
  }

  return {
    blocks: resultBlocks,
    processes: resultProcesses,
    successfulAllocations,
    totalFragmentation,
  }
}

// Worst Fit Algorithm
export function worstFit(blocks: MemoryBlock[], processes: MemoryProcess[]): MemoryAllocationResult {
  const resultBlocks = [...blocks].map((block) => ({
    ...block,
    allocated: false,
    processId: undefined,
    fragmentation: 0,
  }))
  const resultProcesses = [...processes].map((process) => ({ ...process, allocated: false, blockId: undefined }))

  // Assign colors to processes
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  resultProcesses.forEach((process, index) => {
    process.color = colors[index % colors.length]
  })

  let successfulAllocations = 0
  let totalFragmentation = 0

  for (let i = 0; i < resultProcesses.length; i++) {
    const process = resultProcesses[i]
    let worstBlockIndex = -1
    let worstBlockSize = -1

    for (let j = 0; j < resultBlocks.length; j++) {
      const block = resultBlocks[j]

      if (!block.allocated && block.size >= process.size) {
        if (block.size > worstBlockSize) {
          worstBlockIndex = j
          worstBlockSize = block.size
        }
      }
    }

    if (worstBlockIndex !== -1) {
      // Allocate process to the worst fit block
      const block = resultBlocks[worstBlockIndex]
      block.allocated = true
      // block.processId = process.id
      block.fragmentation = block.size - process.size

      process.allocated = true
      // process.blockId = block.id

      successfulAllocations++
      totalFragmentation += block.fragmentation
    }
  }

  return {
    blocks: resultBlocks,
    processes: resultProcesses,
    successfulAllocations,
    totalFragmentation,
  }
}

// Page Replacement Algorithms
export interface PageReference {
  pageNumber: number
  isHit?: boolean
}

export interface PageFrame {
  pageNumber?: number
  lastUsed: number
  isHit?: boolean
  color?: string
}

export interface PageReplacementResult {
  frameStates: PageFrame[][]
  hits: number
  misses: number
  hitRatio: number
}

// FIFO (First In First Out)
export function fifo(references: PageReference[], frameCount: number): PageReplacementResult {
  const frames: PageFrame[] = Array(frameCount)
    .fill(null)
    .map(() => ({ lastUsed: -1 }))
  const frameStates: PageFrame[][] = []
  let hits = 0
  let misses = 0

  // Assign colors to page numbers
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  const pageColors = new Map<number, string>()

  // Process each page reference
  for (let i = 0; i < references.length; i++) {
    const reference = references[i]

    // Assign color if new page
    if (!pageColors.has(reference.pageNumber)) {
      pageColors.set(reference.pageNumber, colors[pageColors.size % colors.length])
    }

    // Check if the page is already in a frame
    const frameIndex = frames.findIndex((frame) => frame.pageNumber === reference.pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      hits++
      frames[frameIndex].isHit = true
    } else {
      // Page miss
      misses++

      // Find the oldest frame (first in)
      const oldestFrameIndex = frames.reduce(
        (oldest, frame, currentIndex, arr) => (frame.lastUsed < arr[oldest].lastUsed ? currentIndex : oldest),
        0,
      )

      // Replace the page in the oldest frame
      frames[oldestFrameIndex] = {
        pageNumber: reference.pageNumber,
        lastUsed: i,
        isHit: false,
        color: pageColors.get(reference.pageNumber) || "",
      }
    }

    // Save the current state of frames
    frameStates.push([...frames.map((frame) => ({ ...frame }))])

    // Reset isHit for next iteration
    frames.forEach((frame) => (frame.isHit = false))
  }

  return {
    frameStates,
    hits,
    misses,
    hitRatio: hits / (hits + misses),
  }
}

// LRU (Least Recently Used)
export function lru(references: PageReference[], frameCount: number): PageReplacementResult {
  const frames: PageFrame[] = Array(frameCount)
    .fill(null)
    .map(() => ({ lastUsed: -1 }))
  const frameStates: PageFrame[][] = []
  let hits = 0
  let misses = 0

  // Assign colors to page numbers
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  const pageColors = new Map<number, string>()

  // Process each page reference
  for (let i = 0; i < references.length; i++) {
    const reference = references[i]

    // Assign color if new page
    if (!pageColors.has(reference.pageNumber)) {
      pageColors.set(reference.pageNumber, colors[pageColors.size % colors.length])
    }

    // Check if the page is already in a frame
    const frameIndex = frames.findIndex((frame) => frame.pageNumber === reference.pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      hits++
      frames[frameIndex].lastUsed = i
      frames[frameIndex].isHit = true
    } else {
      // Page miss
      misses++

      // Find the least recently used frame
      const lruFrameIndex = frames.reduce(
        (lru, frame, currentIndex, arr) => (frame.lastUsed < arr[lru].lastUsed ? currentIndex : lru),
        0,
      )

      // Replace the page in the LRU frame
      frames[lruFrameIndex] = {
        pageNumber: reference.pageNumber,
        lastUsed: i,
        isHit: false,
        color: pageColors.get(reference.pageNumber) || "",
      }
    }

    // Save the current state of frames
    frameStates.push([...frames.map((frame) => ({ ...frame }))])

    // Reset isHit for next iteration
    frames.forEach((frame) => (frame.isHit = false))
  }

  return {
    frameStates,
    hits,
    misses,
    hitRatio: hits / (hits + misses),
  }
}

// Optimal Page Replacement
export function optimal(references: PageReference[], frameCount: number): PageReplacementResult {
  const frames: PageFrame[] = Array(frameCount)
    .fill(null)
    .map(() => ({ lastUsed: -1 }))
  const frameStates: PageFrame[][] = []
  let hits = 0
  let misses = 0

  // Assign colors to page numbers
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  const pageColors = new Map<number, string>()

  // Process each page reference
  for (let i = 0; i < references.length; i++) {
    const reference = references[i]

    // Assign color if new page
    if (!pageColors.has(reference.pageNumber)) {
      pageColors.set(reference.pageNumber, colors[pageColors.size % colors.length])
    }

    // Check if the page is already in a frame
    const frameIndex = frames.findIndex((frame) => frame.pageNumber === reference.pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      hits++
      frames[frameIndex].isHit = true
    } else {
      // Page miss
      misses++

      // Check if there's an empty frame
      const emptyFrameIndex = frames.findIndex((frame) => frame.pageNumber === undefined)

      if (emptyFrameIndex !== -1) {
        // Use the empty frame
        frames[emptyFrameIndex] = {
          pageNumber: reference.pageNumber,
          lastUsed: i,
          isHit: false,
          color: pageColors.get(reference.pageNumber) || "",
        }
      } else {
        // Find the page that will not be used for the longest time in the future
        const futureIndices = frames.map((frame) => {
          const nextUseIndex = references.slice(i + 1).findIndex((ref) => ref.pageNumber === frame.pageNumber)
          return nextUseIndex === -1 ? Number.POSITIVE_INFINITY : i + 1 + nextUseIndex
        })

        const optimalFrameIndex = futureIndices.indexOf(Math.max(...futureIndices))

        // Replace the page in the optimal frame
        frames[optimalFrameIndex] = {
          pageNumber: reference.pageNumber,
          lastUsed: i,
          isHit: false,
          color: pageColors.get(reference.pageNumber) || "",
        }
      }
    }

    // Save the current state of frames
    frameStates.push([...frames.map((frame) => ({ ...frame }))])

    // Reset isHit for next iteration
    frames.forEach((frame) => (frame.isHit = false))
  }

  return {
    frameStates,
    hits,
    misses,
    hitRatio: hits / (hits + misses),
  }
}

// Clock Page Replacement
export function clockAlgorithm(references: PageReference[], frameCount: number): PageReplacementResult {
  interface ClockPageFrame extends PageFrame {
    useFlag: boolean
  }

  const frames: ClockPageFrame[] = Array(frameCount)
    .fill(null)
    .map(() => ({ lastUsed: -1, useFlag: false }))
  const frameStates: PageFrame[][] = []
  let hits = 0
  let misses = 0

  // Assign colors to page numbers
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ]

  const pageColors = new Map<number, string>()
  let pointer = 0 // Clock hand pointer

  // Process each page reference
  for (let i = 0; i < references.length; i++) {
    const reference = references[i]

    // Assign color if new page
    if (!pageColors.has(reference.pageNumber)) {
      pageColors.set(reference.pageNumber, colors[pageColors.size % colors.length])
    }

    // Check if the page is already in a frame
    const frameIndex = frames.findIndex((frame) => frame.pageNumber === reference.pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      hits++
      frames[frameIndex].useFlag = true
      frames[frameIndex].isHit = true
    } else {
      // Page miss
      misses++

      // Check if there's an empty frame
      const emptyFrameIndex = frames.findIndex((frame) => frame.pageNumber === undefined)

      if (emptyFrameIndex !== -1) {
        // Use the empty frame
        frames[emptyFrameIndex] = {
          pageNumber: reference.pageNumber,
          lastUsed: i,
          useFlag: true,
          isHit: false,
          color: pageColors.get(reference.pageNumber) || "",
        }
        pointer = (emptyFrameIndex + 1) % frameCount
      } else {
        // Find a frame to replace using clock algorithm
        while (true) {
          if (frames[pointer].useFlag) {
            // Give second chance
            frames[pointer].useFlag = false
            pointer = (pointer + 1) % frameCount
          } else {
            // Replace the page
            frames[pointer] = {
              pageNumber: reference.pageNumber,
              lastUsed: i,
              useFlag: true,
              isHit: false,
              color: pageColors.get(reference.pageNumber) || "",
            }
            pointer = (pointer + 1) % frameCount
            break
          }
        }
      }
    }

    // Save the current state of frames (without the useFlag)
    frameStates.push([
      ...frames.map((frame) => ({
        pageNumber: frame.pageNumber,
        lastUsed: frame.lastUsed,
        isHit: frame.isHit,
        color: frame.color,
      })),
    ])

    // Reset isHit for next iteration
    frames.forEach((frame) => (frame.isHit = false))
  }

  return {
    frameStates,
    hits,
    misses,
    hitRatio: hits / (hits + misses),
  }
}

// Disk Scheduling Algorithms
export interface DiskRequest {
  trackNumber: number
  order?: number
}

export interface DiskSchedulingResult {
  order: DiskRequest[]
  totalHeadMovement: number
  averageHeadMovement: number
}

// FCFS Disk Scheduling
export function fcfsDisk(requests: DiskRequest[], initialHeadPosition: number): DiskSchedulingResult {
  const orderedRequests = [...requests].map((req, index) => ({ ...req, order: index }))
  let totalHeadMovement = 0
  let currentPosition = initialHeadPosition

  for (const request of orderedRequests) {
    totalHeadMovement += Math.abs(request.trackNumber - currentPosition)
    currentPosition = request.trackNumber
  }

  return {
    order: orderedRequests,
    totalHeadMovement,
    averageHeadMovement: totalHeadMovement / requests.length,
  }
}

// SSTF Disk Scheduling
export function sstf(requests: DiskRequest[], initialHeadPosition: number): DiskSchedulingResult {
  const remainingRequests = [...requests]
  const orderedRequests: DiskRequest[] = []
  let totalHeadMovement = 0
  let currentPosition = initialHeadPosition

  for (let i = 0; i < requests.length; i++) {
    // Find the nearest request
    const distances = remainingRequests.map((req) => Math.abs(req.trackNumber - currentPosition))
    const minDistanceIndex = distances.indexOf(Math.min(...distances))
    const selectedRequest = remainingRequests[minDistanceIndex]

    // Calculate head movement
    totalHeadMovement += Math.abs(selectedRequest.trackNumber - currentPosition)
    currentPosition = selectedRequest.trackNumber

    // Add to ordered requests and remove from remaining
    orderedRequests.push({ ...selectedRequest, order: i })
    remainingRequests.splice(minDistanceIndex, 1)
  }

  return {
    order: orderedRequests,
    totalHeadMovement,
    averageHeadMovement: totalHeadMovement / requests.length,
  }
}

// SCAN Disk Scheduling
export function scan(
  requests: DiskRequest[],
  initialHeadPosition: number,
  diskSize: number,
  direction: "up" | "down",
): DiskSchedulingResult {
  // Sort requests by track number
  const sortedRequests = [...requests].sort((a, b) => a.trackNumber - b.trackNumber)
  const orderedRequests: DiskRequest[] = []
  let totalHeadMovement = 0
  let order = 0

  if (direction === "up") {
    // Requests greater than initial position (moving upward)
    const greaterRequests = sortedRequests.filter((req) => req.trackNumber >= initialHeadPosition)

    // Requests less than initial position (moving downward after reaching the end)
    const lesserRequests = sortedRequests.filter((req) => req.trackNumber < initialHeadPosition)

    // Calculate head movement (up to the highest track)
    if (greaterRequests.length > 0) {
      totalHeadMovement += greaterRequests[greaterRequests.length - 1].trackNumber - initialHeadPosition
      greaterRequests.forEach((req) => orderedRequests.push({ ...req, order: order++ }))
    } else {
      totalHeadMovement += diskSize - 1 - initialHeadPosition
    }

    // Calculate head movement (from highest track down to the last request)
    if (lesserRequests.length > 0) {
      totalHeadMovement += diskSize - 1 - lesserRequests[0].trackNumber
      lesserRequests.reverse().forEach((req) => orderedRequests.push({ ...req, order: order++ }))
    }
  } else {
    // Direction is 'down'
    // Requests less than initial position (moving downward)
    const lesserRequests = sortedRequests.filter((req) => req.trackNumber <= initialHeadPosition)

    // Requests greater than initial position (moving upward after reaching the start)
    const greaterRequests = sortedRequests.filter((req) => req.trackNumber > initialHeadPosition)

    // Calculate head movement (down to the lowest track)
    if (lesserRequests.length > 0) {
      totalHeadMovement += initialHeadPosition - lesserRequests[0].trackNumber
      lesserRequests.reverse().forEach((req) => orderedRequests.push({ ...req, order: order++ }))
    } else {
      totalHeadMovement += initialHeadPosition - 0
    }

    // Calculate head movement (from lowest track up to the last request)
    if (greaterRequests.length > 0) {
      totalHeadMovement += greaterRequests[greaterRequests.length - 1].trackNumber - 0
      greaterRequests.forEach((req) => orderedRequests.push({ ...req, order: order++ }))
    }
  }

  return {
    order: orderedRequests,
    totalHeadMovement,
    averageHeadMovement: totalHeadMovement / requests.length,
  }
}

// C-SCAN Disk Scheduling
export function cScan(requests: DiskRequest[], initialHeadPosition: number, diskSize: number): DiskSchedulingResult {
  // Sort requests by track number
  const sortedRequests = [...requests].sort((a, b) => a.trackNumber - b.trackNumber)
  const orderedRequests: DiskRequest[] = []
  let totalHeadMovement = 0
  let order = 0

  // Requests greater than initial position (moving upward)
  const greaterRequests = sortedRequests.filter((req) => req.trackNumber >= initialHeadPosition)

  // Requests less than initial position (will be served after sweeping back to the beginning)
  const lesserRequests = sortedRequests.filter((req) => req.trackNumber < initialHeadPosition)

  // Calculate head movement (up to the highest track)
  if (greaterRequests.length > 0) {
    totalHeadMovement += diskSize - 1 - initialHeadPosition
    greaterRequests.forEach((req) => orderedRequests.push({ ...req, order: order++ }))
  } else {
    totalHeadMovement += diskSize - 1 - initialHeadPosition
  }

  // Add the seek from highest track to beginning (not counting as a request)
  totalHeadMovement += diskSize - 1

  // Calculate head movement (from beginning up to the last request in lesser)
  if (lesserRequests.length > 0) {
    totalHeadMovement += lesserRequests[lesserRequests.length - 1].trackNumber
    lesserRequests.forEach((req) => orderedRequests.push({ ...req, order: order++ }))
  }

  return {
    order: orderedRequests,
    totalHeadMovement,
    averageHeadMovement: totalHeadMovement / requests.length,
  }
}

// LOOK Disk Scheduling
export function look(
  requests: DiskRequest[],
  initialHeadPosition: number,
  direction: "up" | "down",
): DiskSchedulingResult {
  // Sort requests by track number
  const sortedRequests = [...requests].sort((a, b) => a.trackNumber - b.trackNumber)
  const orderedRequests: DiskRequest[] = []
  let totalHeadMovement = 0
  let order = 0

  if (direction === "up") {
    // Requests greater than initial position (moving upward)
    const greaterRequests = sortedRequests.filter((req) => req.trackNumber >= initialHeadPosition)

    // Requests less than initial position (moving downward after reaching the highest request)
    const lesserRequests = sortedRequests.filter((req) => req.trackNumber < initialHeadPosition)

    // Calculate head movement (up to the highest request)
    if (greaterRequests.length > 0) {
      totalHeadMovement += greaterRequests[greaterRequests.length - 1].trackNumber - initialHeadPosition
      greaterRequests.forEach((req) => orderedRequests.push({ ...req, order: order++ }))

      // Calculate head movement (from highest request down to the lowest request)
      if (lesserRequests.length > 0) {
        totalHeadMovement += greaterRequests[greaterRequests.length - 1].trackNumber - lesserRequests[0].trackNumber
        lesserRequests.reverse().forEach((req) => orderedRequests.push({ ...req, order: order++ }))
      }
    } else if (lesserRequests.length > 0) {
      // If no greater requests, just move to the closest lesser request
      lesserRequests.reverse().forEach((req) => orderedRequests.push({ ...req, order: order++ }))
      totalHeadMovement += initialHeadPosition - lesserRequests[0].trackNumber
    }
  } else {
    // Direction is 'down'
    // Requests less than initial position (moving downward)
    const lesserRequests = sortedRequests.filter((req) => req.trackNumber <= initialHeadPosition)

    // Requests greater than initial position (moving upward after reaching the lowest request)
    const greaterRequests = sortedRequests.filter((req) => req.trackNumber > initialHeadPosition)

    // Calculate head movement (down to the lowest request)
    if (lesserRequests.length > 0) {
      totalHeadMovement += initialHeadPosition - lesserRequests[0].trackNumber
      lesserRequests.reverse().forEach((req) => orderedRequests.push({ ...req, order: order++ }))

      // Calculate head movement (from lowest request up to the highest request)
      if (greaterRequests.length > 0) {
        totalHeadMovement += greaterRequests[greaterRequests.length - 1].trackNumber - lesserRequests[0].trackNumber
        greaterRequests.forEach((req) => orderedRequests.push({ ...req, order: order++ }))
      }
    } else if (greaterRequests.length > 0) {
      // If no lesser requests, just move to the closest greater request
      greaterRequests.forEach((req) => orderedRequests.push({ ...req, order: order++ }))
      totalHeadMovement += greaterRequests[0].trackNumber - initialHeadPosition
    }
  }

  return {
    order: orderedRequests,
    totalHeadMovement,
    averageHeadMovement: totalHeadMovement / requests.length,
  }
}

// Deadlock Algorithms
export interface ResourceType {
  id: number
  total: number
  available: number
}

export interface DeadlockProcess {
  id: string
  allocation: number[]
  request: number[] // Max - Allocation = Need
  max: number[]
  finished?: boolean
  safeSequence?: number
}

export interface BankersResult {
  isSafe: boolean
  safeSequence: string[]
  availableResources: number[]
  processStates: DeadlockProcess[][]
}

// Banker's Algorithm
export function bankersAlgorithm(processes: DeadlockProcess[], resources: ResourceType[]): BankersResult {
  const numProcesses = processes.length
  const numResources = resources.length

  // Create deep copies of the data
  const processStates: DeadlockProcess[][] = []
  const workingProcesses = processes.map((p) => ({
    ...p,
    finished: false,
    max: [...p.max],
    allocation: [...p.allocation],
    request: p.max.map((max, i) => max - p.allocation[i]),
  }))

  const availableResources = resources.map((r) => r.available)
  const safeSequence: string[] = []

  let count = 0

  // Find a safe sequence
  while (count < numProcesses) {
    let found = false

    for (let i = 0; i < numProcesses; i++) {
      if (!workingProcesses[i].finished) {
        let canAllocate = true

        // Check if all resource needs can be satisfied
        for (let j = 0; j < numResources; j++) {
          if (workingProcesses[i].request[j] > availableResources[j]) {
            canAllocate = false
            break
          }
        }

        if (canAllocate) {
          // Process can be executed
          // Add process to safe sequence
          safeSequence.push(workingProcesses[i].id)
          workingProcesses[i].finished = true
          workingProcesses[i].safeSequence = count

          // Release resources
          for (let j = 0; j < numResources; j++) {
            availableResources[j] += workingProcesses[i].allocation[j]
          }

          // Save the current state
          processStates.push(JSON.parse(JSON.stringify(workingProcesses)))

          count++
          found = true
        }
      }
    }

    // If no process could be allocated resources in this iteration, deadlock exists
    if (!found) {
      break
    }
  }

  return {
    isSafe: count === numProcesses,
    safeSequence,
    availableResources,
    processStates,
  }
}

// Deadlock Detection
export function deadlockDetection(
  processes: DeadlockProcess[],
  resources: ResourceType[],
): {
  hasDeadlock: boolean
  deadlockedProcesses: string[]
  processStates: DeadlockProcess[][]
} {
  const numProcesses = processes.length
  const numResources = resources.length

  // Create deep copies of the data
  const processStates: DeadlockProcess[][] = []
  const workingProcesses = processes.map((p) => ({
    ...p,
    finished: false,
    max: [...p.max],
    allocation: [...p.allocation],
    request: p.max.map((max, i) => max - p.allocation[i]),
  }))

  const availableResources = resources.map((r) => r.available)

  let count = 0

  // Try to find processes that can finish
  while (count < numProcesses) {
    let found = false

    for (let i = 0; i < numProcesses; i++) {
      if (!workingProcesses[i].finished) {
        let canComplete = true

        // Check if all resource requests can be satisfied
        for (let j = 0; j < numResources; j++) {
          if (workingProcesses[i].request[j] > availableResources[j]) {
            canComplete = false
            break
          }
        }

        if (canComplete) {
          // Process can complete
          workingProcesses[i].finished = true

          // Release resources
          for (let j = 0; j < numResources; j++) {
            availableResources[j] += workingProcesses[i].allocation[j]
          }

          // Save the current state
          processStates.push(JSON.parse(JSON.stringify(workingProcesses)))

          count++
          found = true
        }
      }
    }

    // If no process could complete in this iteration, deadlock exists
    if (!found) {
      break
    }
  }

  // Identify deadlocked processes
  const deadlockedProcesses = workingProcesses.filter((p) => !p.finished).map((p) => p.id)

  return {
    hasDeadlock: count < numProcesses,
    deadlockedProcesses,
    processStates,
  }
}
