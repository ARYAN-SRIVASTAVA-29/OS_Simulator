import type { GanttChartProps } from "./GanttChartProps" // Assuming GanttChartProps is defined in another file

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

  // Define explicit background colors instead of using Tailwind classes
  const getBackgroundColor = (color: string) => {
    const colorMap: Record<string, string> = {
      "bg-blue-500": "rgb(59, 130, 246)",
      "bg-green-500": "rgb(34, 197, 94)",
      "bg-purple-500": "rgb(168, 85, 247)",
      "bg-red-500": "rgb(239, 68, 68)",
      "bg-yellow-500": "rgb(234, 179, 8)",
      "bg-indigo-500": "rgb(99, 102, 241)",
      "bg-pink-500": "rgb(236, 72, 153)",
      "bg-orange-500": "rgb(249, 115, 22)",
    }

    return colorMap[color] || "rgb(107, 114, 128)" // Default to gray if color not found
  }

  return (
    <div>
      <div className="flex h-[60px] w-full items-center rounded-md border border-neutral-800">
        <div className="flex h-full w-full">
          {schedule.map((item, index) => {
            const width = ((item.end - item.start) / totalTime) * 100
            const backgroundColor = getBackgroundColor(item.color)

            return (
              <div
                key={`${item.id}-${index}`}
                className="flex h-full items-center justify-center text-white"
                style={{
                  width: `${width}%`,
                  backgroundColor: backgroundColor,
                }}
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
