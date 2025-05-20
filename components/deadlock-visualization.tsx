"use client"

import type { DeadlockProcess, ResourceType } from "@/utils/algorithms"

interface DeadlockVisualizationProps {
  processes: DeadlockProcess[]
  resources: ResourceType[]
  isSafe?: boolean
  safeSequence?: string[]
  hasDeadlock?: boolean
  deadlockedProcesses?: string[]
}

export function DeadlockVisualization({
  processes,
  resources,
  isSafe,
  safeSequence,
  hasDeadlock,
  deadlockedProcesses,
}: DeadlockVisualizationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Resource Allocation</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border">Process</th>
                {resources.map((resource, i) => (
                  <th key={i} className="p-2 border">
                    Resource {resource.id}
                  </th>
                ))}
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process, i) => (
                <tr key={i}>
                  <td className="p-2 border">{process.id}</td>
                  {resources.map((_, j) => (
                    <td key={j} className="p-2 border">
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-400">Allocated: {process.allocation[j]}</span>
                        <span className="text-xs text-neutral-400">Max: {process.max[j]}</span>
                        <span className="text-xs text-neutral-400">Need: {process.request[j]}</span>
                      </div>
                    </td>
                  ))}
                  <td className="p-2 border">
                    {process.finished ? (
                      <span className="text-green-500">
                        {safeSequence && process.safeSequence !== undefined
                          ? `Safe (${process.safeSequence + 1})`
                          : "Finished"}
                      </span>
                    ) : (
                      <span className="text-red-500">
                        {deadlockedProcesses?.includes(process.id) ? "Deadlocked" : "Waiting"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Resource Availability</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {resources.map((resource, index) => (
            <div key={index} className="p-4 rounded-md border">
              <div className="font-medium">Resource {resource.id}</div>
              <div className="mt-2 text-sm">
                <div>Total: {resource.total}</div>
                <div>Available: {resource.available}</div>
                <div>Allocated: {resource.total - resource.available}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {safeSequence && (
        <div className="p-4 rounded-md border border-green-500 bg-green-500/10">
          <h3 className="text-lg font-medium text-green-700 dark:text-green-300">Safe Sequence</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {safeSequence.map((processId, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-md"
              >
                {index + 1}. {processId}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasDeadlock && deadlockedProcesses && (
        <div className="p-4 rounded-md border border-red-500 bg-red-500/10">
          <h3 className="text-lg font-medium text-red-700 dark:text-red-300">Deadlock Detected</h3>
          <p className="mt-2 text-red-500">Deadlock detected between processes:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {deadlockedProcesses.map((processId, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded-md"
              >
                {processId}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
