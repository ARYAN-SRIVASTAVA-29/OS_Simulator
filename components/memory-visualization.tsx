"use client"

import type { MemoryBlock, MemoryProcess } from "@/utils/algorithms"

interface MemoryVisualizationProps {
  blocks: MemoryBlock[]
  processes: MemoryProcess[]
}

export function MemoryVisualization({ blocks, processes }: MemoryVisualizationProps) {
  // Find the maximum block size to calculate proportions
  const maxBlockSize = Math.max(...blocks.map((block) => block.size))

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Memory Blocks</h3>
        <div className="flex flex-col space-y-2">
          {blocks.map((block) => {
            const width = (block.size / maxBlockSize) * 100
            return (
              <div key={block.id} className="relative h-16">
                <div
                  className="absolute top-0 left-0 h-full border border-neutral-600 rounded-md flex items-center justify-start px-2 bg-neutral-800/20"
                  style={{ width: `${width}%` }}
                >
                  <span className="text-sm font-medium">
                    Block {block.id} ({block.size} KB)
                  </span>
                </div>

                {block.allocated && (
                  <div
                    className={`absolute top-0 left-0 h-full flex items-center justify-center text-white rounded-md ${
                      processes.find((p) => p.id === block.processId)?.color || "bg-gray-500"
                    }`}
                    style={{
                      width: `${((block.size - (block.fragmentation || 0)) / maxBlockSize) * 100}%`,
                    }}
                  >
                    <span className="text-sm">{block.processId}</span>
                  </div>
                )}

                {block.allocated && block.fragmentation && block.fragmentation > 0 && (
                  <div
                    className="absolute top-0 h-full bg-gray-300 flex items-center justify-center text-gray-700 rounded-r-md"
                    style={{
                      width: `${(block.fragmentation / maxBlockSize) * 100}%`,
                      right: `${100 - width}%`,
                    }}
                  >
                    <span className="text-xs">{block.fragmentation} KB</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Processes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processes.map((process) => (
            <div
              key={process.id}
              className={`p-4 rounded-md border ${process.allocated ? "border-green-500" : "border-red-500"}`}
            >
              <div className="flex justify-between">
                <span className="font-medium">{process.id}</span>
                <span className="text-sm">{process.size} KB</span>
              </div>
              <div className="mt-2 flex items-center">
                <div className={`h-4 w-4 rounded-full mr-2 ${process.color || "bg-gray-500"}`}></div>
                <span className="text-sm">
                  {process.allocated ? `Allocated to Block ${process.blockId}` : "Not allocated"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
