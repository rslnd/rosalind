import React from 'react'

const nf0 = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 1 })

const isNil = n => n == null || Number.isNaN(n)

export const fmtInt = n => isNil(n) ? '–' : nf0.format(n)
export const fmtNum = n => isNil(n) ? '–' : nf1.format(n)
export const fmtHours = n => isNil(n) ? '–' : `${nf1.format(n)} h`
export const fmtPct = v => isNil(v) ? '–' : `${nf1.format(v * 100)} %`

export const formatters = { int: fmtInt, num: fmtNum, hours: fmtHours, pct: fmtPct }

// Muted "Vorjahr: x (±diff)" comparison line, sign-explicit, neutral coloring.
export const Comparison = ({ current, previous, kind = 'int' }) => {
  if (previous == null || Number.isNaN(previous)) {
    return <small className='text-quite-muted hide-print'>&nbsp;</small>
  }

  const fmt = formatters[kind] || fmtInt
  const cur = current || 0
  const prev = previous || 0
  const rawDiff = cur - prev

  let diffText
  if (kind === 'pct') {
    diffText = `${nf1.format(Math.abs(rawDiff) * 100)} pp`
  } else if (kind === 'hours') {
    diffText = `${nf1.format(Math.abs(rawDiff))} h`
  } else if (kind === 'num') {
    diffText = nf1.format(Math.abs(rawDiff))
  } else {
    diffText = nf0.format(Math.abs(rawDiff))
  }

  const arrow = rawDiff > 0 ? '▲' : rawDiff < 0 ? '▼' : '▬'
  const sign = rawDiff > 0 ? '+' : rawDiff < 0 ? '−' : '±'

  return (
    <small className='text-muted' style={{ whiteSpace: 'nowrap' }}>
      VJ {fmt(prev)} <span title='Veränderung zum Vorjahr'>{arrow} {sign}{diffText}</span>
    </small>
  )
}

// A value with its previous-year comparison stacked underneath.
export const Metric = ({ current, previous, kind = 'int', strong }) => {
  const fmt = formatters[kind] || fmtInt
  return (
    <span>
      <span style={{ fontWeight: strong ? 700 : 400 }}>{fmt(current)}</span>
      <br />
      <Comparison current={current} previous={previous} kind={kind} />
    </span>
  )
}
