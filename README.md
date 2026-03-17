# echarts-ssr

A Claude Code skill that generates data visualization charts using ECharts server-side rendering, outputting SVG or PNG files.

## Features

- **Natural language → Chart**: Describe your data in plain text, Claude auto-selects the best chart type
- **All ECharts chart types**: Bar, line, pie, scatter, radar, heatmap, treemap, sankey, candlestick, gauge, funnel, etc.
- **SVG & PNG output**: SVG (default, zero native deps) or PNG (2x retina)
- **Modern built-in themes**: `modern` (light), `modern-dark` (dark), plus ECharts built-in `dark`
- **Flexible backgrounds**: White (default), black, transparent, or any custom color

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate a chart
echo '{"xAxis":{"type":"category","data":["Q1","Q2","Q3","Q4"]},"yAxis":{"type":"value"},"series":[{"type":"bar","data":[120,200,150,280]}]}' \
  | node render.mjs -o chart.svg
```

## Usage Modes

### Auto Mode
Just describe your data — Claude picks the chart type automatically.

> "Show me a bar chart of quarterly revenue: Q1 120, Q2 200, Q3 150, Q4 280"

### Semi-Control Mode
Specify chart type + style parameters.

> "Line chart + dark theme + 1600x900 + png"

## CLI Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--output` / `-o` | required | Output file path (.svg or .png) |
| `--width` | `800` | Chart width (px) |
| `--height` | `600` | Chart height (px) |
| `--theme` | `modern` | Theme: `modern`, `modern-dark`, `dark`, `none` |
| `--bg` | auto by theme | Background: `white`, `black`, `transparent`, or hex color |
| `--pixel-ratio` | `2` | PNG device pixel ratio |

## Themes

| Theme | Style |
|-------|-------|
| `modern` (default) | Light background, modern color palette, dashed gridlines, rounded bars |
| `modern-dark` | Dark background (#141414), bright data colors |
| `dark` | ECharts built-in dark theme |
| `none` | Raw ECharts defaults |

## Requirements

- Node.js >= 18
- `echarts` (npm, included in package.json)
- `canvas` (npm, for PNG output — requires system cairo libs on macOS: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`)

## License

MIT
