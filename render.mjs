#!/usr/bin/env node
/**
 * ECharts SSR Renderer - Reads ECharts option JSON from stdin, outputs SVG or PNG.
 *
 * Usage:
 *   echo '<json>' | node render.mjs -o chart.svg [--width 800] [--height 600] [--theme modern-dark] [--bg '#fff']
 */
import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname, dirname } from 'node:path';

// ─── Modern Theme Definitions ───────────────────────────────────────────────

const MODERN_PALETTE = [
  '#5B8FF9', // 克莱因蓝
  '#5AD8A6', // 薄荷绿
  '#F6BD16', // 琥珀黄
  '#E86452', // 珊瑚红
  '#6DC8EC', // 天空蓝
  '#945FB9', // 紫藤
  '#FF9845', // 橘橙
  '#1E9493', // 青碧
  '#FF99C3', // 樱花粉
  '#269A99', // 孔雀绿
];

const MODERN_LIGHT = {
  color: MODERN_PALETTE,
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
    color: '#404040',
  },
  title: {
    textStyle: { fontSize: 18, fontWeight: 600, color: '#1a1a1a' },
    subtextStyle: { fontSize: 12, color: '#8c8c8c' },
  },
  legend: {
    textStyle: { color: '#595959', fontSize: 12 },
    itemWidth: 16,
    itemHeight: 8,
    itemGap: 16,
  },
  tooltip: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#e8e8e8',
    borderWidth: 1,
    textStyle: { color: '#333', fontSize: 13 },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px;',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#d9d9d9' } },
    axisTick: { lineStyle: { color: '#d9d9d9' } },
    axisLabel: { color: '#8c8c8c', fontSize: 12 },
    splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#8c8c8c', fontSize: 12 },
    splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
  },
  line: {
    smooth: false,
    symbolSize: 6,
    lineStyle: { width: 2.5 },
  },
  bar: {
    barMaxWidth: 48,
    itemStyle: { borderRadius: [4, 4, 0, 0] },
  },
  pie: {
    itemStyle: { borderColor: '#fff', borderWidth: 2 },
  },
  scatter: {
    symbolSize: 10,
    itemStyle: { opacity: 0.75 },
  },
  radar: {
    splitArea: { areaStyle: { color: ['rgba(91,143,249,0.04)', 'rgba(91,143,249,0.01)'] } },
    axisLine: { lineStyle: { color: '#e8e8e8' } },
    splitLine: { lineStyle: { color: '#e8e8e8' } },
  },
  gauge: {
    axisLine: { lineStyle: { color: [[0.3, '#E86452'], [0.7, '#F6BD16'], [1, '#5AD8A6']] } },
  },
};

const MODERN_DARK = {
  color: [
    '#5B8FF9',
    '#61DDAA',
    '#F6BD16',
    '#F6903D',
    '#78D3F8',
    '#9661BC',
    '#F08BB4',
    '#008685',
    '#F6C022',
    '#7262FD',
  ],
  backgroundColor: '#141414',
  textStyle: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
    color: '#d4d4d4',
  },
  title: {
    textStyle: { fontSize: 18, fontWeight: 600, color: '#f0f0f0' },
    subtextStyle: { fontSize: 12, color: '#8c8c8c' },
  },
  legend: {
    textStyle: { color: '#b0b0b0', fontSize: 12 },
    itemWidth: 16,
    itemHeight: 8,
    itemGap: 16,
  },
  tooltip: {
    backgroundColor: 'rgba(30,30,30,0.96)',
    borderColor: '#404040',
    borderWidth: 1,
    textStyle: { color: '#e0e0e0', fontSize: 13 },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.3); border-radius: 8px;',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#404040' } },
    axisTick: { lineStyle: { color: '#404040' } },
    axisLabel: { color: '#8c8c8c', fontSize: 12 },
    splitLine: { lineStyle: { color: '#2a2a2a', type: 'dashed' } },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#8c8c8c', fontSize: 12 },
    splitLine: { lineStyle: { color: '#2a2a2a', type: 'dashed' } },
  },
  line: {
    smooth: false,
    symbolSize: 6,
    lineStyle: { width: 2.5 },
  },
  bar: {
    barMaxWidth: 48,
    itemStyle: { borderRadius: [4, 4, 0, 0] },
  },
  pie: {
    itemStyle: { borderColor: '#141414', borderWidth: 2 },
  },
  scatter: {
    symbolSize: 10,
    itemStyle: { opacity: 0.8 },
  },
  radar: {
    splitArea: { areaStyle: { color: ['rgba(91,143,249,0.08)', 'rgba(91,143,249,0.02)'] } },
    axisLine: { lineStyle: { color: '#333' } },
    splitLine: { lineStyle: { color: '#333' } },
  },
  gauge: {
    axisLine: { lineStyle: { color: [[0.3, '#E86452'], [0.7, '#F6BD16'], [1, '#61DDAA']] } },
  },
};

// ─── CLI Parsing ────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    output:        { type: 'string', short: 'o' },
    width:         { type: 'string', default: '800' },
    height:        { type: 'string', default: '600' },
    format:        { type: 'string' },
    theme:         { type: 'string' },
    bg:            { type: 'string' },
    'pixel-ratio': { type: 'string', default: '2' },
  },
});

if (!values.output) {
  console.error('Error: --output / -o is required');
  process.exit(1);
}

const width = parseInt(values.width) || 800;
const height = parseInt(values.height) || 600;
const format = values.format || (extname(values.output).toLowerCase() === '.png' ? 'png' : 'svg');
const pixelRatio = parseInt(values['pixel-ratio']) || 2;

// Resolve theme: default → modern, modern-dark, dark (builtin), or none
const themeName = values.theme ?? 'modern';

// Resolve background: auto-detect based on theme if not explicitly set
const BG_DEFAULTS = {
  'modern':      '#ffffff',
  'modern-dark': '#141414',
  'dark':        '#333333',
  'none':        '#ffffff',
};
const bgInput = values.bg;
const bg = bgInput === 'transparent' ? 'transparent'
         : bgInput === 'white'       ? '#ffffff'
         : bgInput === 'black'       ? '#000000'
         : bgInput                    ?? BG_DEFAULTS[themeName]
                                      ?? '#ffffff';

// Read JSON from stdin
let input;
try {
  input = readFileSync(0, 'utf-8');
} catch {
  console.error('Error: Failed to read from stdin. Pipe ECharts option JSON via stdin.');
  process.exit(1);
}

let option;
try {
  option = JSON.parse(input);
} catch (e) {
  console.error(`Error: Invalid JSON - ${e.message}`);
  process.exit(1);
}

// Apply background color (skip only when transparent and option has no bg set)
if (bg === 'transparent') {
  // Explicit transparent: remove any theme-injected bg
  if (!option.backgroundColor) {
    option.backgroundColor = 'transparent';
  }
} else if (bg) {
  option.backgroundColor = option.backgroundColor || bg;
}

// Ensure output directory exists
mkdirSync(dirname(values.output) || '.', { recursive: true });

try {
  if (format === 'svg') {
    await renderSVG(option, values.output, width, height, themeName);
  } else {
    await renderPNG(option, values.output, width, height, themeName, pixelRatio);
  }
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exit(1);
}

// ─── Register Custom Themes ─────────────────────────────────────────────────

function registerThemes(echarts) {
  echarts.registerTheme('modern', MODERN_LIGHT);
  echarts.registerTheme('modern-dark', MODERN_DARK);
}

// ─── Renderers ──────────────────────────────────────────────────────────────

async function renderSVG(option, outputPath, w, h, theme) {
  const echarts = await import('echarts');
  registerThemes(echarts);
  const chart = echarts.init(null, theme === 'none' ? undefined : theme, {
    renderer: 'svg',
    ssr: true,
    width: w,
    height: h,
  });
  chart.setOption(option);
  const svgStr = chart.renderToSVGString();
  writeFileSync(outputPath, svgStr);
  chart.dispose();
  const sizeKB = Math.round(Buffer.byteLength(svgStr) / 1024);
  console.log(`OK ${outputPath} (SVG, ${w}x${h}, ${sizeKB} KB, theme=${theme})`);
}

async function renderPNG(option, outputPath, w, h, theme, ratio) {
  let createCanvas;
  try {
    ({ createCanvas } = await import('canvas'));
  } catch {
    console.error('Error: PNG output requires the "canvas" package. Install it with:');
    console.error('  cd .agents/skills/echarts-ssr && npm install canvas');
    console.error('Or use SVG output instead (change extension to .svg).');
    process.exit(1);
  }

  const echarts = await import('echarts');
  registerThemes(echarts);
  const canvas = createCanvas(w * ratio, h * ratio);
  const chart = echarts.init(canvas, theme === 'none' ? undefined : theme, {
    width: w,
    height: h,
    devicePixelRatio: ratio,
  });
  chart.setOption(option);
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(outputPath, buffer);
  chart.dispose();
  const sizeKB = Math.round(buffer.length / 1024);
  console.log(`OK ${outputPath} (PNG, ${w}x${h}@${ratio}x, ${sizeKB} KB, theme=${theme})`);
}
