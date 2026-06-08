// Tree-shaken ECharts setup. Only the chart types + components actually used on the
// dashboard are pulled in — keeps the async chunk under ~80kb gzip vs the ~280kb a full
// `import * as echarts` would drag. Called from the chart components themselves so the
// registration runs on demand, alongside the dynamic import of `vue-echarts`.
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, SankeyChart } from 'echarts/charts'
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
    SankeyChart,
    LineChart,
    GridComponent,
    LegendComponent,
    TitleComponent,
    TooltipComponent,
  ])
  registered = true
}

// ECharts canvas renderer does not parse CSS custom properties — passing
// `var(--color-primary)` straight to itemStyle.color paints black. Resolve the var to
// its computed hex/rgb at call time so the chart picks up the design-token color.
// SSR-safe: returns empty string if document is missing (component is async-loaded inside
// an ssr:false route, but the guard is cheap insurance).
export function cssVar(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
