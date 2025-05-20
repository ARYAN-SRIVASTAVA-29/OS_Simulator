"use client"

import type { PageFrame } from "@/utils/algorithms"

interface PageVisualizationProps {
  frameStates: PageFrame[][]
  frameCount: number
  references: number[]
}

export function PageVisualization({ frameStates, frameCount, references }: PageVisualizationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Page Reference String</h3>
        <div className="flex flex-wrap gap-2">
          {references.map((ref, index) => (
            <div key={index} className="h-8 w-8 flex items-center justify-center border rounded-md">
              {ref}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Frame States</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border">Reference</th>
                {Array.from({ length: frameCount }).map((_, i) => (
                  <th key={i} className="p-2 border">
                    Frame {i + 1}
                  </th>
                ))}
                <th className="p-2 border">Hit/Miss</th>
              </tr>
            </thead>
            <tbody>
              {frameStates.map((state, i) => (
                <tr key={i}>
                  <td className="p-2 border text-center">{references[i]}</td>
                  {state.map((frame, j) => (
                    <td
                      key={j}
                      className={`p-2 border text-center ${
                        frame.isHit ? "bg-green-500/30" : frame.pageNumber !== undefined ? frame.color : ""
                      }`}
                    >
                      {frame.pageNumber !== undefined ? frame.pageNumber : "-"}
                    </td>
                  ))}
                  <td className="p-2 border text-center">
                    {state.some((frame) => frame.isHit) ? (
                      <span className="text-green-500">Hit</span>
                    ) : (
                      <span className="text-red-500">Miss</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
