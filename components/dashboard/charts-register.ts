// Tree-shaken ECharts setup. Only the chart types + components actually used on the
// dashboard are pulled in — keeps the async chunk under ~80kb gzip vs the ~280kb a full
// `import * as echarts` would drag. Called from the chart components themselves so the
// registration runs on demand, alongside the dynamic import of `vue-echarts`.
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'

let registered = false

export function registerEcharts(): void {
  if (registered) return
  use([
    CanvasRenderer,
    BarChart,
    PieChart,
    GridComponent,
    LegendComponent,
    TitleComponent,
    TooltipComponent,
  ])
  registered = true
}
