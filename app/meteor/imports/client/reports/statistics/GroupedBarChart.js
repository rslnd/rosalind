import React from 'react'
import { AXIS_COLOR, TEXT_COLOR, HOVER_STROKE } from './flowPalette'

const VIEW_W = 820

// Reusable bar chart (grouped or stacked) with a crosshair that follows the
// cursor and snaps to bar values.
//   - vertical line tracks the cursor's x (live)
//   - horizontal line snaps to the hovered bar/segment's value, labelled at the
//     y-axis; the hovered bar is highlighted and the others dimmed.
//
// Props:
//   categories : [{ key, label }]
//   series     : [{ id, label, color, values:number[] }]  (Vorjahr first → left)
//   stacked    : boolean (segments stacked per category instead of grouped)
//   yFormat    : (v) => string
//   yMax       : optional fixed axis max
//   height     : viewBox height (default 300)
//   ariaLabel  : accessibility label
export class GroupedBarChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hover: null } // { ci, si, vx, value }
    this.onMove = this.onMove.bind(this)
    this.onLeave = this.onLeave.bind(this)
  }

  onMove (e) {
    const L = this.layout
    if (!L) { return }
    const rect = e.currentTarget.getBoundingClientRect()
    const vx = (e.clientX - rect.left) * (VIEW_W / rect.width)
    const vy = (e.clientY - rect.top) * (L.height / rect.height)
    if (vy < L.plotTop - 6 || vy > L.plotBottom + 6) { this.onLeave(); return }

    let ci = Math.floor((vx - L.plotLeft) / L.slotW)
    ci = Math.max(0, Math.min(L.n - 1, ci))

    // Value at the cursor's height (axis reading) for the free-floating mode.
    const clampY = Math.max(L.plotTop, Math.min(L.plotBottom, vy))
    const freeVal = L.yMax * (L.plotBottom - clampY) / (L.plotBottom - L.plotTop)

    let hover
    if (L.stacked) {
      // segment band containing the cursor → snap; otherwise free
      let acc = 0
      let picked = null
      for (let k = 0; k < L.series.length; k++) {
        const v = L.series[k].values[ci] || 0
        const yTop = L.yFor(acc + v)
        const yBot = L.yFor(acc)
        if (vy >= yTop && vy <= yBot && v > 0) { picked = { si: k, value: v, top: acc + v }; break }
        acc += v
      }
      hover = picked
        ? { mode: 'bar', ci, si: picked.si, value: picked.value, topY: L.yFor(picked.top), vx, vy }
        : { mode: 'free', ci, si: null, value: freeVal, topY: vy, vx, vy }
    } else {
      const rel = vx - (L.plotLeft + ci * L.slotW + L.groupPad)
      const si = Math.max(0, Math.min(L.series.length - 1, Math.floor(rel / (L.barW + L.innerGap))))
      const value = L.series[si].values[ci] || 0
      const barX = L.plotLeft + ci * L.slotW + L.groupPad + si * (L.barW + L.innerGap)
      const overBar = value > 0 && vx >= barX && vx <= barX + L.barW && vy >= L.yFor(value)
      hover = overBar
        ? { mode: 'bar', ci, si, value, topY: L.yFor(value), vx, vy }
        : { mode: 'free', ci, si: null, value: freeVal, topY: vy, vx, vy }
    }
    this.setState({ hover })
  }

  onLeave () { if (this.state.hover) { this.setState({ hover: null }) } }

  render () {
    const { categories = [], series = [], yFormat = v => `${v}`, height = 300, ariaLabel, stacked = false, infoHideSeries = false } = this.props
    if (!categories.length || !series.length) { return null }

    const M = { left: 42, right: 14, top: 16, bottom: 40 }
    const plotLeft = M.left
    const plotRight = VIEW_W - M.right
    const plotTop = M.top
    const plotBottom = height - M.bottom
    const plotW = plotRight - plotLeft
    const plotH = plotBottom - plotTop

    const n = categories.length
    let rawMax
    if (stacked) {
      rawMax = Math.max(1, ...categories.map((c, ci) => series.reduce((s, ser) => s + (ser.values[ci] || 0), 0)))
    } else {
      rawMax = Math.max(1, ...series.reduce((acc, s) => acc.concat(s.values), []))
    }
    const yMax = this.props.yMax != null ? this.props.yMax : (Math.ceil(rawMax / 5) * 5 || 5)

    const slotW = plotW / n
    const groupW = slotW * 0.58 // wider gaps between groups (months)
    const groupPad = (slotW - groupW) / 2
    const innerGap = (!stacked && series.length > 1) ? 3 : 0
    const barW = stacked ? groupW : Math.max(2, (groupW - innerGap * (series.length - 1)) / series.length)

    const yFor = v => plotBottom - (v / yMax) * plotH
    const xForGroup = i => plotLeft + i * slotW + groupPad
    const yTicks = [0, 0.5, 1].map(f => f * yMax)
    const labelEvery = n > 14 ? Math.ceil(n / 12) : 1

    this.layout = { plotLeft, plotRight, plotTop, plotBottom, slotW, groupPad, barW, innerGap, n, series, yFor, stacked, height, yMax }

    const hover = this.state.hover

    // Info label near the cursor: the bar's value when over a bar, otherwise the
    // axis value read off at the cursor's height.
    let info = null
    if (hover) {
      const text = hover.mode === 'bar'
        ? ((infoHideSeries || series.length === 1)
            ? `${categories[hover.ci].label}: ${yFormat(hover.value)}`
            : `${categories[hover.ci].label} · ${series[hover.si].label}: ${yFormat(hover.value)}`)
        : yFormat(hover.value)
      const boxW = Math.min(VIEW_W - 8, text.length * 6.0 + 14)
      let bx = hover.vx + 12
      if (bx + boxW > plotRight) { bx = hover.vx - 12 - boxW }
      if (bx < plotLeft) { bx = plotLeft }
      let by = hover.vy - 24
      if (by < plotTop) { by = hover.vy + 12 }
      info = { text, bx, by, boxW }
    }

    return (
      <svg viewBox={`0 0 ${VIEW_W} ${height}`} style={{ width: '100%', height: 'auto' }} role='img' aria-label={ariaLabel}
        onMouseMove={this.onMove} onMouseLeave={this.onLeave}>
        {/* vertical y-axis + horizontal baseline (no dashed gridlines) */}
        <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} stroke={AXIS_COLOR} strokeWidth={1} />
        {yTicks.map((v, i) => (
          <g key={i}>
            {i === 0 &&
              <line x1={plotLeft} y1={yFor(v)} x2={plotRight} y2={yFor(v)} stroke={AXIS_COLOR} strokeWidth={1} />}
            <text x={plotLeft - 6} y={yFor(v) + 3} textAnchor='end' fontSize='10' fill={TEXT_COLOR}>{yFormat(v)}</text>
          </g>
        ))}

        {categories.map((cat, ci) => {
          const gx = xForGroup(ci)
          let acc = 0
          return (
            <g key={cat.key}>
              {series.map((s, si) => {
                const v = s.values[ci] || 0
                let x, y, h
                if (stacked) {
                  x = gx
                  y = yFor(acc + v)
                  h = yFor(acc) - yFor(acc + v)
                  acc += v
                } else {
                  x = gx + si * (barW + innerGap)
                  y = yFor(v)
                  h = plotBottom - yFor(v)
                }
                const isHovered = hover && hover.mode === 'bar' && hover.ci === ci && hover.si === si
                const dim = hover && hover.mode === 'bar' && !isHovered
                return (
                  <rect key={s.id} x={x} y={y} width={barW} height={h}
                    fill={s.color} rx={2}
                    opacity={dim ? 0.4 : 1}
                    stroke={isHovered ? HOVER_STROKE : (stacked ? '#fff' : 'none')} strokeWidth={isHovered ? 1.5 : (stacked ? 0.75 : 0)}>
                    <title>{`${cat.label} · ${s.label}: ${yFormat(v)}`}</title>
                  </rect>
                )
              })}
              {ci % labelEvery === 0 &&
                <text x={gx + groupW / 2} y={plotBottom + 14} textAnchor='middle' fontSize='9' fill={TEXT_COLOR}>
                  {cat.label}
                </text>}
            </g>
          )
        })}

        {/* horizontal live line: follows the cursor, snaps to a bar when over one */}
        {hover && info && (
          <g pointerEvents='none'>
            <line x1={plotLeft} y1={hover.topY} x2={plotRight} y2={hover.topY}
              stroke={HOVER_STROKE} strokeWidth={1} strokeDasharray='4 3' />
            <rect x={info.bx} y={info.by} width={info.boxW} height={18} rx={3} fill={HOVER_STROKE} opacity={0.94} />
            <text x={info.bx + 7} y={info.by + 13} fontSize='11' fontWeight='700' fill='#fff'>{info.text}</text>
          </g>
        )}
      </svg>
    )
  }
}
