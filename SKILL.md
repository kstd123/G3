---
name: echarts-ssr
description: "使用 ECharts 生成数据可视化图表，服务端渲染输出 SVG/PNG。支持所有 ECharts 图表类型：折线图、柱状图、饼图、散点图、雷达图、热力图、树图、桑基图、K线图、仪表盘、漏斗图等。支持自动选图和半控制模式。Triggers: chart, graph, 图表, 数据可视化, echarts, 折线图, 柱状图, 饼图, visualization, plot, diagram, 散点图, 雷达图, generate chart, 生成图表"
allowed-tools: Bash(node *render.mjs*)
---

# ECharts SSR - 数据可视化图表生成

使用 ECharts 服务端渲染生成 SVG/PNG 图表。Claude 负责将用户的自然语言需求转换为 ECharts option JSON，然后调用渲染脚本输出文件。

## Quick Start

```bash
echo '<ECharts Option JSON>' | node .agents/skills/echarts-ssr/render.mjs -o output/chart.svg
```

## 两种使用模式

### 自动模式

用户只给一句话描述 + 数据，Claude 自动选择图表类型、配色、布局。

用户示例：
- "帮我画一个图表，展示这几个月的销售数据：1月120万，2月200万，3月150万"
- "visualize this data as a chart: Apple 35%, Samsung 28%, Xiaomi 15%, Others 22%"

Claude 的处理流程：
1. 分析数据形状（分类、时间序列、占比、分布等）
2. 根据下方「自动选图指南」选择最佳图表类型
3. 生成完整的 ECharts option JSON（包含 tooltip、legend、合理配色）
4. 调用渲染脚本输出 SVG（默认）

### 半控制模式

用户指定图表类型和风格参数，Claude 据此生成配置。

用户示例：
- "折线图 + 深色主题 + 1600x900 + svg"
- "pie chart, dark theme, png, 1200x800"

Claude 将用户指定的参数映射到 CLI flags：
```bash
echo '<JSON>' | node .agents/skills/echarts-ssr/render.mjs -o output/chart.svg --theme dark --width 1600 --height 900
```

## 自动选图指南

| 数据形状 | 推荐图表 | ECharts type |
|---------|---------|-------------|
| 分类 + 单值（≤7项） | 纵向柱状图 | `bar` |
| 分类 + 单值（>7项） | 横向柱状图 | `bar`（交换 x/yAxis） |
| 时间序列（1-3条线） | 折线图 | `line` |
| 时间序列（多条线） | 堆叠面积图 | `line` + `areaStyle` + `stack` |
| 占比/份额（≤7项） | 饼图/环形图 | `pie` |
| 占比/份额（>7项） | 矩形树图 | `treemap` |
| 两个数值维度 | 散点图 | `scatter` |
| 多维度对比 | 雷达图 | `radar` |
| 流向/关系 | 桑基图 | `sankey` |
| 层级结构 | 旭日图 | `sunburst` |
| 分布 | 直方图 | `bar`（连续 x 轴） |
| 股票/金融 | K线图 | `candlestick` |
| 单指标进度 | 仪表盘 | `gauge` |
| 漏斗转化 | 漏斗图 | `funnel` |

## Examples

### 柱状图

```bash
echo '{
  "tooltip": {},
  "xAxis": {"type": "category", "data": ["Q1", "Q2", "Q3", "Q4"]},
  "yAxis": {"type": "value"},
  "series": [{"name": "Revenue", "type": "bar", "data": [120, 200, 150, 280]}]
}' | node .agents/skills/echarts-ssr/render.mjs -o output/bar.svg
```

### 折线图

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

### 饼图

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

### 散点图

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

### 雷达图

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

### 深色主题 + PNG

```bash
echo '{
  "xAxis": {"type": "category", "data": ["A", "B", "C", "D"]},
  "yAxis": {"type": "value"},
  "series": [{"type": "bar", "data": [5, 20, 36, 10]}]
}' | node .agents/skills/echarts-ssr/render.mjs -o output/dark.png --theme modern-dark --width 1600 --height 900
```

## CLI 参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--output` / `-o` | 必填 | 输出文件路径（.svg 或 .png） |
| `--width` | `800` | 图表宽度 (px) |
| `--height` | `600` | 图表高度 (px) |
| `--format` | 按扩展名自动判断 | 强制指定 `svg` 或 `png` |
| `--theme` | `modern` | 主题：`modern`、`modern-dark`、`dark`、`none` |
| `--bg` | 跟随主题自动 | 背景色：`white`、`black`、`transparent`、或任意色值如 `#1a1a2e` |
| `--pixel-ratio` | `2` | PNG 设备像素比（影响清晰度） |

## 主题

内置 4 套主题，默认使用 `modern`：

| 主题名 | 风格 | 说明 |
|--------|------|------|
| `modern` | 浅色（默认） | 现代配色，柔和网格线，圆角柱状图，系统字体栈 |
| `modern-dark` | 深色 | 深色背景 (#141414)，明亮数据色，自动设置深色背景 |
| `dark` | 深色（ECharts 内置） | ECharts 原生深色主题 |
| `none` | 无主题 | 使用 ECharts 最原始的默认样式 |

**配色板 (modern)：**
克莱因蓝 `#5B8FF9` · 薄荷绿 `#5AD8A6` · 琥珀黄 `#F6BD16` · 珊瑚红 `#E86452` · 天空蓝 `#6DC8EC` · 紫藤 `#945FB9` · 橘橙 `#FF9845` · 青碧 `#1E9493` · 樱花粉 `#FF99C3` · 孔雀绿 `#269A99`

使用深色主题示例：
```bash
echo '<JSON>' | node .agents/skills/echarts-ssr/render.mjs -o output/chart.png --theme modern-dark
```

**背景色规则：**
- 不指定 `--bg` 时自动跟随主题：`modern` → 白色，`modern-dark` → `#141414`
- `--bg white` / `--bg black` / `--bg transparent` 为快捷方式
- `--bg '#1a1a2e'` 等任意色值也支持
- 也可在 option JSON 中设置 `backgroundColor`（优先级最高）

## ECharts Option 编写要点

1. **始终添加 `tooltip`**：即使 SSR 静态图，tooltip 配置影响数据标签布局
2. **多系列时添加 `legend`**：便于区分不同数据系列
3. **设置 `grid` 边距**：避免轴标签被裁切，尤其是长文本标签
   ```json
   "grid": {"left": "15%", "right": "10%", "bottom": "15%", "containLabel": true}
   ```
4. **中文文本**：确保设置合适的字体
   ```json
   "textStyle": {"fontFamily": "PingFang SC, Microsoft YaHei, sans-serif"}
   ```
5. **配色**：modern 主题已内置优质配色板，无需额外指定 color 数组，除非用户有特殊要求
6. **数据标签**：需要直接在图上显示数值时，使用 `label: {show: true}`
7. **响应式**：SVG 输出可在浏览器中自由缩放

## Setup

首次使用需安装依赖：

```bash
cd .agents/skills/echarts-ssr && npm install
```

SVG 输出开箱即用。PNG 输出需要系统安装 cairo 等原生库（macOS）：

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```
