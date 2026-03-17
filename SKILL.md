---
name: echarts-ssr
description: "Generate data visualization charts using ECharts with server-side rendering, outputting SVG or PNG. Supports all ECharts chart types: line, bar, pie, scatter, radar, heatmap, treemap, sankey, candlestick, gauge, funnel, sunburst, etc. Supports auto chart selection and semi-control mode. Triggers: chart, graph, visualization, echarts, plot, diagram, generate chart, bar chart, line chart, pie chart, 图表, 数据可视化, 折线图, 柱状图, 饼图, 散点图, 雷达图, 生成图表"
allowed-tools: Bash(node *render.mjs*)
---

# ECharts SSR - Data Visualization Chart Generation

Generate SVG/PNG charts using ECharts server-side rendering. Claude converts the user's natural language request into an ECharts option JSON, then calls the rendering script to output the file.

## Quick Start

```bash
echo '<ECharts Option JSON>' | node .agents/skills/echarts-ssr/render.mjs -o output/chart.svg
```

## Two Usage Modes

### Auto Mode

User provides a sentence + data. Claude automatically selects chart type, colors, and layout.

User examples:
- "Draw a chart showing monthly sales: Jan $120K, Feb $200K, Mar $150K"
- "Visualize market share: Apple 35%, Samsung 28%, Xiaomi 15%, Others 22%"

Claude's workflow:
1. Analyze data shape (categorical, time series, proportional, distribution, etc.)
2. Select the best chart type using the "Auto Chart Selection Guide" below
3. Generate a complete ECharts option JSON (including tooltip, legend, reasonable color scheme)
4. Call the rendering script to output SVG (default)

### Semi-Control Mode

User specifies chart type and style parameters. Claude maps them to configuration.

User examples:
- "Line chart + dark theme + 1600x900 + svg"
- "Pie chart, dark theme, png, 1200x800"

Claude maps user-specified parameters to CLI flags:
```bash
echo '<JSON>' | node .agents/skills/echarts-ssr/render.mjs -o output/chart.svg --theme modern-dark --width 1600 --height 900
```

## Auto Chart Selection Guide

| Data Shape | Recommended Chart | ECharts Type |
|-----------|-------------------|-------------|
| Categories + single values (≤7) | Vertical bar chart | `bar` |
| Categories + single values (>7) | Horizontal bar chart | `bar` (swap x/yAxis) |
| Time series (1–3 lines) | Line chart | `line` |
| Time series (many lines) | Stacked area chart | `line` + `areaStyle` + `stack` |
| Parts of whole (≤7) | Pie / Donut chart | `pie` |
| Parts of whole (>7) | Treemap | `treemap` |
| Two numeric dimensions | Scatter plot | `scatter` |
| Multi-dimension comparison | Radar chart | `radar` |
| Flow / relationships | Sankey diagram | `sankey` |
| Hierarchy | Sunburst / Treemap | `sunburst` |
| Distribution | Histogram | `bar` (continuous x-axis) |
| Financial / stock | Candlestick chart | `candlestick` |
| Single metric progress | Gauge | `gauge` |
| Funnel conversion | Funnel chart | `funnel` |

## Examples

### Bar Chart

```bash
echo '{
  "tooltip": {},
  "xAxis": {"type": "category", "data": ["Q1", "Q2", "Q3", "Q4"]},
  "yAxis": {"type": "value"},
  "series": [{"name": "Revenue", "type": "bar", "data": [120, 200, 150, 280]}]
}' | node .agents/skills/echarts-ssr/render.mjs -o output/bar.svg
```

### Line Chart

```bash
echo '{
  "tooltip": {"trigger": "axis"},
  "legend": {"data": ["2024", "2025"]},
  "xAxis": {"type": "category", "data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]},
  "yAxis": {"type": "value"},
  "series": [
    {"name": "2024", "type": "line", "data": [820, 932, 901, 934, 1290, 1330]},
    {"name": "2025", "type": "line", "data": [620, 732, 1101, 1234, 1090, 1530]}
  ]
}' | node .agents/skills/echarts-ssr/render.mjs -o output/line.svg
```

### Pie Chart

```bash
echo '{
  "tooltip": {"trigger": "item"},
  "legend": {"orient": "vertical", "left": "left"},
  "series": [{
    "name": "Market Share",
    "type": "pie",
    "radius": "60%",
    "data": [
      {"value": 1048, "name": "Apple"},
      {"value": 735, "name": "Samsung"},
      {"value": 580, "name": "Xiaomi"},
      {"value": 484, "name": "OPPO"},
      {"value": 300, "name": "Others"}
    ]
  }]
}' | node .agents/skills/echarts-ssr/render.mjs -o output/pie.svg
```

### Scatter Plot

```bash
echo '{
  "tooltip": {},
  "xAxis": {"type": "value", "name": "Height (cm)"},
  "yAxis": {"type": "value", "name": "Weight (kg)"},
  "series": [{
    "type": "scatter",
    "data": [[161,51],[167,59],[159,49],[157,63],[155,53],[170,59],[159,47],[166,69],[176,66],[160,75]]
  }]
}' | node .agents/skills/echarts-ssr/render.mjs -o output/scatter.svg
```

### Radar Chart

```bash
echo '{
  "tooltip": {},
  "radar": {
    "indicator": [
      {"name": "Sales", "max": 6500},
      {"name": "Admin", "max": 16000},
      {"name": "Tech", "max": 30000},
      {"name": "Support", "max": 38000},
      {"name": "Dev", "max": 52000}
    ]
  },
  "series": [{
    "type": "radar",
    "data": [
      {"value": [4200, 3000, 20000, 35000, 50000], "name": "Budget"},
      {"value": [5000, 14000, 28000, 26000, 42000], "name": "Actual"}
    ]
  }]
}' | node .agents/skills/echarts-ssr/render.mjs -o output/radar.svg
```

### Dark Theme + PNG

```bash
echo '{
  "xAxis": {"type": "category", "data": ["A", "B", "C", "D"]},
  "yAxis": {"type": "value"},
  "series": [{"type": "bar", "data": [5, 20, 36, 10]}]
}' | node .agents/skills/echarts-ssr/render.mjs -o output/dark.png --theme modern-dark --width 1600 --height 900
```

## CLI Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--output` / `-o` | required | Output file path (`.svg` or `.png`) |
| `--width` | `800` | Chart width (px) |
| `--height` | `600` | Chart height (px) |
| `--format` | auto by extension | Force `svg` or `png` |
| `--theme` | `modern` | Theme: `modern`, `modern-dark`, `dark`, `none` |
| `--bg` | auto by theme | Background: `white`, `black`, `transparent`, or any hex color like `#1a1a2e` |
| `--pixel-ratio` | `2` | PNG device pixel ratio (affects sharpness) |

## Themes

4 built-in themes, `modern` is the default:

| Theme | Style | Description |
|-------|-------|-------------|
| `modern` | Light (default) | Modern palette, dashed gridlines, rounded bars, system font stack |
| `modern-dark` | Dark | Dark background (#141414), bright data colors, auto dark bg |
| `dark` | Dark (ECharts built-in) | Native ECharts dark theme |
| `none` | No theme | Raw ECharts default styling |

**Modern color palette:**
Klein Blue `#5B8FF9` · Mint `#5AD8A6` · Amber `#F6BD16` · Coral `#E86452` · Sky `#6DC8EC` · Wisteria `#945FB9` · Tangerine `#FF9845` · Teal `#1E9493` · Sakura `#FF99C3` · Peacock `#269A99`

**Dark theme example:**
```bash
echo '<JSON>' | node .agents/skills/echarts-ssr/render.mjs -o output/chart.png --theme modern-dark
```

**Background color rules:**
- No `--bg` specified → auto by theme: `modern` = white, `modern-dark` = `#141414`
- `--bg white` / `--bg black` / `--bg transparent` are shortcuts
- `--bg '#1a1a2e'` or any hex color value is also supported
- `backgroundColor` in option JSON takes highest priority

## ECharts Option Best Practices

1. **Always include `tooltip`** — Even in SSR static output, tooltip config affects data label layout
2. **Add `legend` for multi-series** — Helps distinguish different data series
3. **Set `grid` margins** — Prevents axis labels from being clipped, especially with long text labels
   ```json
   "grid": {"left": "15%", "right": "10%", "bottom": "15%", "containLabel": true}
   ```
4. **CJK text support** — Set an appropriate font for Chinese/Japanese/Korean text
   ```json
   "textStyle": {"fontFamily": "PingFang SC, Microsoft YaHei, sans-serif"}
   ```
5. **Colors** — The modern theme has a high-quality built-in palette; no need for a custom color array unless specifically requested
6. **Data labels** — Use `label: {"show": true}` to display values directly on the chart
7. **Responsive** — SVG output can be freely scaled in browsers

## Setup

First-time setup — install dependencies:

```bash
cd .agents/skills/echarts-ssr && npm install
```

SVG output works out of the box. PNG output requires native Cairo libraries on the system (macOS):

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```
