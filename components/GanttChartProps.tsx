export interface GanttChartItem {
  id: string
  start: number
  end: number
  color: string
}

export interface GanttChartProps {
  schedule: GanttChartItem[]
  height?: number
}
