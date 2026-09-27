// Shared colors for the patient-flow charts. Kept consistent with the existing
// reports charts (LeadTimeChart / AssigneeBars), whose blue is validated via
// scripts/validate_palette.js. Sequential single-hue blue for magnitude
// (heatmap), brand blue vs. neutral grey for the online/internal split, and a
// recency ramp (current darker than the comparison period).

export const BRAND = '#256abf' // primary blue (magnitude / online / current)
export const NEUTRAL = '#9aa7b8' // neutral grey (internal / baseline / cancellations)
export const PIE_ONLINE = '#3b82c4' // clear, friendly blue
export const PIE_INTERNAL = '#f2b134' // gelborange (yellow-orange); distinct from online
export const COMPARE = '#9ec3ea' // lighter blue for the comparison period (Vorjahr)
export const RED = '#c0392b' // no-shows / complementary bar
export const ORANGE = '#e6a41e' // gelborange line (blue/orange is CVD-safe)

export const AXIS_COLOR = '#ccc'
export const TEXT_COLOR = '#666'
export const EMPTY_CELL = '#f4f6f9'
export const HOVER_STROKE = '#1b2b3a'

// Categorical palette for comparing several cohorts (doctors / periods / types)
// in one chart. Distinct hues, CVD-safe ordering (blue/orange lead), cycled when
// there are more cohorts than colors.
export const SERIES_COLORS = [
  '#256abf', // blue
  '#e6a41e', // gelborange
  '#2e8b6f', // teal green
  '#c0392b', // red
  '#7d5ba6', // purple
  '#3aa0d1', // sky blue
  '#c9762f', // burnt orange
  '#5a6b7b' // slate
]
export const seriesColorAt = (i) => SERIES_COLORS[((i % SERIES_COLORS.length) + SERIES_COLORS.length) % SERIES_COLORS.length]

// Pale variant of a cohort color for its Vorjahr (year-over-year) overlay:
// mix ~55 % toward white. Accepts #rgb / #rrggbb.
export const paleOf = (color, amount = 0.55) => {
  const hex = String(color).replace('#', '')
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex
  const num = parseInt(full, 16)
  if (Number.isNaN(num) || full.length !== 6) { return color }
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  const mix = (c) => Math.round(c + (255 - c) * amount)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

// Sequential blue ramp anchors (near-white → dark), interpolated in sRGB.
const RAMP_LO = [232, 240, 251] // #e8f0fb
const RAMP_HI = [13, 54, 107] // #0d366b

const clamp01 = t => (t < 0 ? 0 : t > 1 ? 1 : t)
const lerp = (a, b, t) => Math.round(a + (b - a) * t)

// t in [0,1] → blue along the sequential ramp.
export const blueFor = (t) => {
  const f = clamp01(t)
  const r = lerp(RAMP_LO[0], RAMP_HI[0], f)
  const g = lerp(RAMP_LO[1], RAMP_HI[1], f)
  const b = lerp(RAMP_LO[2], RAMP_HI[2], f)
  return `rgb(${r}, ${g}, ${b})`
}

// White text once the fill is dark enough to need it.
export const textOn = (t) => (t > 0.55 ? '#fff' : '#33475b')
