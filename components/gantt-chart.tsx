"use client"

import type { GanttChartItem } from "@/utils/algorithms"

interface GanttChartProps {
  schedule: GanttChartItem[]
  height?: number
}

export function GanttChart({ schedule, height = 60 }: GanttChartProps) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="flex h-12 w-full items-center justify-center rounded-md border border-neutral-800">
        <p className="text-neutral-400">No data to display</p>
      </div>
    )
  }

  // Calculate the total time span
  const startTime = 0
  const endTime = Math.max(...schedule.map((item) => item.end))
  const totalTime = endTime - startTime

  // Group overlapping processes for visualization
  const timeLabels = Array.from(
    new Set([startTime, ...schedule.map((item) => item.start), ...schedule.map((item) => item.end)]),
  ).sort((a, b) => a - b)

  return (
    <div>
      <div className="flex h-[60px] w-full items-center rounded-md border border-neutral-800">
        <div className="flex h-full w-full">
          {schedule.map((item, index) => {
            const width = ((item.end - item.start) / totalTime) * 100
            return (
              <div
                key={`${item.id}-${index}`}
                className={`flex h-full items-center justify-center ${item.color} text-white`}
                style={{ width: `${width}%` }}
                title={`${item.id}: ${item.start} - ${item.end}`}
              >
                {width > 5 ? item.id : null}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex justify-between mt-1 text-xs text-neutral-400">
        {timeLabels.map((time, index) => (
          <span key={index}>{time}</span>
        ))}
      </div>
    </div>
  )
}
