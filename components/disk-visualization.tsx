"use client"

import type { DiskRequest } from "@/utils/algorithms"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DiskVisualizationProps {
  requests: DiskRequest[]
  orderedRequests: DiskRequest[]
  initialHeadPosition: number
  diskSize: number
}

interface ChartDataItem {
  trackNumber: number
  position: string
  requestId?: string
}

export function DiskVisualization({
  requests,
  orderedRequests,
  initialHeadPosition,
  diskSize,
}: DiskVisualizationProps) {
  // Create data for chart
  const chartData: ChartDataItem[] = [{ trackNumber: initialHeadPosition, position: "Initial" }]

  orderedRequests.forEach((req, index) => {
    chartData.push({
      trackNumber: req.trackNumber,
      position: `Step ${index + 1}`,
      requestId: req.order !== undefined ? `Request ${req.order + 1}` : undefined,
    })
  })

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Head Movement Visualization</h3>
        <div className="h-64 w-full">
          <ChartContainer
            config={{
              headMovement: {
                label: "Head Movement",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="position" />
                <YAxis domain={[0, diskSize]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="trackNumber"
                  stroke="var(--color-headMovement)"
                  name="Head Position"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Request Execution Order</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedRequests.map((request, index) => (
            <div key={index} className="p-4 rounded-md border">
              <div className="flex justify-between items-center">
                <span className="font-medium">Step {index + 1}</span>
                <span className="text-sm px-2 py-1 bg-muted rounded-md">Track {request.trackNumber}</span>
              </div>
              <div className="mt-2 text-sm text-neutral-400">
                {index === 0 ? (
                  <span>
                    Initial Position: {initialHeadPosition} → Track {request.trackNumber}
                  </span>
                ) : (
                  <span>
                    Track {chartData[index].trackNumber} → Track {request.trackNumber}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
