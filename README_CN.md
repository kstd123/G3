# G3

[English](./README.md)

一个 [Claude Code](https://claude.ai/code) 技能（Skill），使用 ECharts 服务端渲染（SSR）生成数据可视化图表。用自然语言描述你的数据，即刻获得可发布的 SVG 或 PNG 图表。

<p align="center">
  <img src="https://img.shields.io/badge/ECharts-5.x-blue" alt="ECharts 5.x">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-green" alt="Node.js >= 18">
  <img src="https://img.shields.io/badge/输出-SVG%20%7C%20PNG-orange" alt="SVG | PNG">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT">
</p>

## 特性

- **自然语言 → 图表** — 用一句话描述数据，Claude 自动选择最佳图表类型、配色和布局
- **全图表类型** — 柱状图、折线图、饼图、散点图、雷达图、热力图、树图、桑基图、旭日图、K线图、仪表盘、漏斗图等
- **SVG & PNG 输出** — SVG（默认，零原生依赖，可缩放）或 PNG（2x 视网膜屏清晰度）
- **现代内置主题** — `modern`（浅色）和 `modern-dark`（深色），精心设计的配色板
- **灵活背景** — 白色（默认）、黑色、透明、或任意自定义颜色
- **开箱即用** — 合理默认值，无需额外配置

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 生成图表（通过 stdin 管道传入 ECharts option JSON）
echo '{"xAxis":{"type":"category","data":["Q1","Q2","Q3","Q4"]},"yAxis":{"type":"value"},"series":[{"type":"bar","data":[120,200,150,280]}]}' \
  | node render.mjs -o chart.svg
```

## 两种使用模式

### 自动模式

只需一句话 + 数据，Claude 分析数据形状并自动选择最佳图表类型。

> *"帮我画一个图表，展示这几个月的销售数据：1月120万，2月200万，3月150万"*

> *"用图表展示市场份额：Apple 35%，Samsung 28%，Xiaomi 15%，Others 22%"*

### 半控制模式

指定图表类型和风格参数，Claude 将其映射为 ECharts 配置和 CLI 参数。

> *"折线图 + 深色主题 + 1600x900 + svg"*

> *"横向柱状图，透明背景，png"*

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

## CLI 参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--output` / `-o` | **必填** | 输出文件路径（`.svg` 或 `.png`） |
| `--width` | `800` | 图表宽度 (px) |
| `--height` | `600` | 图表高度 (px) |
| `--format` | 按扩展名自动判断 | 强制指定 `svg` 或 `png` |
| `--theme` | `modern` | 主题：`modern`、`modern-dark`、`dark`、`none` |
| `--bg` | 跟随主题自动 | 背景色：`white`、`black`、`transparent`、或任意色值 |
| `--pixel-ratio` | `2` | PNG 设备像素比（影响清晰度） |

## 主题

内置 4 套主题，默认使用 `modern`：

| 主题名 | 风格 | 说明 |
|--------|------|------|
| `modern` | 浅色（默认） | 现代配色，虚线网格，圆角柱状图，系统字体栈 |
| `modern-dark` | 深色 | 深色背景 (#141414)，明亮数据色，自动设置深色背景 |
| `dark` | 深色（ECharts 内置） | ECharts 原生深色主题 |
| `none` | 无主题 | ECharts 最原始的默认样式 |

**Modern 配色板：**

克莱因蓝 `#5B8FF9` · 薄荷绿 `#5AD8A6` · 琥珀黄 `#F6BD16` · 珊瑚红 `#E86452` · 天空蓝 `#6DC8EC` · 紫藤 `#945FB9` · 橘橙 `#FF9845` · 青碧 `#1E9493` · 樱花粉 `#FF99C3` · 孔雀绿 `#269A99`

### 背景色规则

- **不指定 `--bg`** → 自动跟随主题：`modern` = 白色，`modern-dark` = `#141414`
- **快捷值**：`--bg white`、`--bg black`、`--bg transparent`
- **自定义**：`--bg '#1a1a2e'` 等任意色值
- **JSON 覆盖**：option JSON 中的 `backgroundColor` 优先级最高

## 示例

### 柱状图

```bash
echo '{
  "tooltip": {},
  "xAxis": {"type": "category", "data": ["Q1", "Q2", "Q3", "Q4"]},
  "yAxis": {"type": "value"},
  "series": [{"name": "营收", "type": "bar", "data": [120, 200, 150, 280]}]
}' | node render.mjs -o bar.svg
```

### 多系列折线图

```bash
echo '{
  "tooltip": {"trigger": "axis"},
  "legend": {"data": ["2024", "2025"]},
  "xAxis": {"type": "category", "data": ["1月","2月","3月","4月","5月","6月"]},
  "yAxis": {"type": "value"},
  "series": [
    {"name": "2024", "type": "line", "data": [820, 932, 901, 934, 1290, 1330]},
    {"name": "2025", "type": "line", "data": [620, 732, 1101, 1234, 1090, 1530]}
  ]
}' | node render.mjs -o line.svg
```

### 饼图

```bash
echo '{
  "tooltip": {"trigger": "item"},
  "legend": {"orient": "vertical", "left": "left"},
  "series": [{
    "type": "pie", "radius": "60%",
    "data": [
      {"value": 1048, "name": "Apple"},
      {"value": 735, "name": "Samsung"},
      {"value": 580, "name": "小米"},
      {"value": 484, "name": "OPPO"},
      {"value": 300, "name": "其他"}
    ]
  }]
}' | node render.mjs -o pie.svg
```

### 深色主题 + PNG

```bash
echo '{
  "xAxis": {"type": "category", "data": ["A","B","C","D"]},
  "yAxis": {"type": "value"},
  "series": [{"type": "bar", "data": [5, 20, 36, 10]}]
}' | node render.mjs -o dark.png --theme modern-dark --width 1600 --height 900
```

### 透明背景

```bash
echo '{...}' | node render.mjs -o chart.png --bg transparent
```

## 工作原理

```
用户（自然语言 + 数据）
  → Claude 生成 ECharts option JSON
    → stdin 管道 → render.mjs → SVG / PNG 文件
```

渲染脚本是纯工具——所有智能部分（图表类型选择、布局、样式）由 Claude 根据 SKILL.md 的指引完成。

## 环境要求

- **Node.js** >= 18
- **echarts**（已包含在 `package.json`）
- **canvas**（已包含在 `package.json`，用于 PNG 输出）

PNG 输出需要系统安装 Cairo 原生库。macOS 上：

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

SVG 输出无需任何原生依赖，开箱即用。

## 作为 Claude Code Skill 安装

将此目录复制到你的 Claude Code 技能路径：

```bash
cp -r . /path/to/project/.agents/skills/echarts-ssr/
cd /path/to/project/.agents/skills/echarts-ssr/ && npm install
```

## 许可证

MIT
