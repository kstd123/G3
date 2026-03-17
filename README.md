# echarts-ssr

[中文文档](./README_CN.md)

A [Claude Code](https://claude.ai/code) skill for generating data visualization charts using ECharts server-side rendering (SSR). Describe your data in natural language — get publication-ready SVG or PNG charts instantly.

<p align="center">
  <img src="https://img.shields.io/badge/ECharts-5.x-blue" alt="ECharts 5.x">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-green" alt="Node.js >= 18">
  <img src="https://img.shields.io/badge/Output-SVG%20%7C%20PNG-orange" alt="SVG | PNG">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT">
</p>

## Features

- **Natural Language → Chart** — Describe your data in plain text, Claude auto-selects the best chart type, colors, and layout
- **All ECharts Chart Types** — Bar, line, pie, scatter, radar, heatmap, treemap, sankey, sunburst, candlestick, gauge, funnel, and more
- **SVG & PNG Output** — SVG (default, zero native deps, scalable) or PNG (2x retina)
- **Modern Built-in Themes** — `modern` (light) and `modern-dark` with carefully curated color palettes
- **Flexible Backgrounds** — White (default), black, transparent, or any custom color
- **Zero Config** — Works out of the box with sensible defaults

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate a chart (pipe ECharts option JSON via stdin)
echo '{"xAxis":{"type":"category","data":["Q1","Q2","Q3","Q4"]},"yAxis":{"type":"value"},"series":[{"type":"bar","data":[120,200,150,280]}]}' \
  | node render.mjs -o chart.svg
```

## Usage Modes

### Auto Mode

Just give a sentence + data. Claude analyzes the data shape and picks the best chart type.

> *"Show me a chart of quarterly revenue: Q1 $120K, Q2 $200K, Q3 $150K, Q4 $280K"*

> *"Visualize market share: Apple 35%, Samsung 28%, Xiaomi 15%, Others 22%"*

### Semi-Control Mode

Specify chart type and style parameters. Claude maps them to ECharts options and CLI flags.

> *"Line chart + dark theme + 1600x900 + png"*

> *"Horizontal bar chart, transparent background, svg"*

## Auto Chart Selection Guide

| Data Shape | Recommended Chart | ECharts Type |
|-----------|-------------------|-------------|
| Categories + values (≤7) | Vertical bar | `bar` |
| Categories + values (>7) | Horizontal bar | `bar` (swap axes) |
| Time series (1–3 lines) | Line chart | `line` |
| Time series (many lines) | Stacked area | `line` + `areaStyle` + `stack` |
| Parts of whole (≤7) | Pie / Donut | `pie` |
| Parts of whole (>7) | Treemap | `treemap` |
| Two numeric dimensions | Scatter plot | `scatter` |
| Multi-dimension comparison | Radar | `radar` |
| Flow / relationships | Sankey | `sankey` |
| Hierarchy | Sunburst / Treemap | `sunburst` |
| Distribution | Histogram | `bar` (continuous x-axis) |
| Financial / stock | Candlestick | `candlestick` |
| Single metric progress | Gauge | `gauge` |
| Funnel conversion | Funnel | `funnel` |

## CLI Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--output` / `-o` | **required** | Output file path (`.svg` or `.png`) |
| `--width` | `800` | Chart width in pixels |
| `--height` | `600` | Chart height in pixels |
| `--format` | auto by extension | Force `svg` or `png` |
| `--theme` | `modern` | Theme: `modern`, `modern-dark`, `dark`, `none` |
| `--bg` | auto by theme | Background: `white`, `black`, `transparent`, or any hex color |
| `--pixel-ratio` | `2` | Device pixel ratio for PNG (affects sharpness) |

## Themes

4 built-in themes, `modern` is the default:

| Theme | Style | Description |
|-------|-------|-------------|
| `modern` | Light (default) | Modern palette, dashed gridlines, rounded bars, system font stack |
| `modern-dark` | Dark | Dark background (#141414), bright data colors |
| `dark` | Dark (ECharts built-in) | Native ECharts dark theme |
| `none` | No theme | Raw ECharts defaults |

**Modern color palette:**

`#5B8FF9` Klein Blue · `#5AD8A6` Mint · `#F6BD16` Amber · `#E86452` Coral · `#6DC8EC` Sky · `#945FB9` Wisteria · `#FF9845` Tangerine · `#1E9493` Teal · `#FF99C3` Sakura · `#269A99` Peacock

### Background Rules

- **No `--bg` specified** → auto by theme: `modern` = white, `modern-dark` = `#141414`
- **Shortcuts**: `--bg white`, `--bg black`, `--bg transparent`
- **Custom**: `--bg '#1a1a2e'` or any hex color
- **Override in JSON**: `backgroundColor` in the option JSON takes highest priority

## Examples

### Bar Chart

```bash
echo '{
  "tooltip": {},
  "xAxis": {"type": "category", "data": ["Q1", "Q2", "Q3", "Q4"]},
  "yAxis": {"type": "value"},
  "series": [{"name": "Revenue", "type": "bar", "data": [120, 200, 150, 280]}]
}' | node render.mjs -o bar.svg
```

### Line Chart (Multi-series)

```bash
echo '{
  "tooltip": {"trigger": "axis"},
  "legend": {"data": ["2024", "2025"]},
  "xAxis": {"type": "category", "data": ["Jan","Feb","Mar","Apr","May","Jun"]},
  "yAxis": {"type": "value"},
  "series": [
    {"name": "2024", "type": "line", "data": [820, 932, 901, 934, 1290, 1330]},
    {"name": "2025", "type": "line", "data": [620, 732, 1101, 1234, 1090, 1530]}
  ]
}' | node render.mjs -o line.svg
```

### Pie Chart

```bash
echo '{
  "tooltip": {"trigger": "item"},
  "legend": {"orient": "vertical", "left": "left"},
  "series": [{
    "type": "pie", "radius": "60%",
    "data": [
      {"value": 1048, "name": "Apple"},
      {"value": 735, "name": "Samsung"},
      {"value": 580, "name": "Xiaomi"},
      {"value": 484, "name": "OPPO"},
      {"value": 300, "name": "Others"}
    ]
  }]
}' | node render.mjs -o pie.svg
```

### Dark Theme + PNG

```bash
echo '{
  "xAxis": {"type": "category", "data": ["A","B","C","D"]},
  "yAxis": {"type": "value"},
  "series": [{"type": "bar", "data": [5, 20, 36, 10]}]
}' | node render.mjs -o dark.png --theme modern-dark --width 1600 --height 900
```

### Transparent Background

```bash
echo '{...}' | node render.mjs -o chart.png --bg transparent
```

## How It Works

```
User (natural language + data)
  → Claude generates ECharts option JSON
    → stdin pipe → render.mjs → SVG / PNG file
```

The rendering script is a pure tool — all the intelligence (chart type selection, layout, styling) comes from Claude interpreting the SKILL.md instructions.

## Requirements

- **Node.js** >= 18
- **echarts** (included in `package.json`)
- **canvas** (included in `package.json`, for PNG output)

PNG output requires native Cairo libraries. On macOS:

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

SVG output works with zero native dependencies.

## Installation as Claude Code Skill

Copy this directory into your Claude Code skills path:

```bash
cp -r . /path/to/project/.agents/skills/echarts-ssr/
cd /path/to/project/.agents/skills/echarts-ssr/ && npm install
```

## License

MIT
