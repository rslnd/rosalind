import React from 'react'
import { __ } from '../../../i18n'
import { Tile, TileRow } from './Tile'
import { fmtInt, fmtPct } from './format'

const ratio = (v, base) => (base > 0 && v != null) ? v / base : null

// Absolute number with its share underneath (muted). The share base is spelled
// out so the percentages stay unambiguous ("der Termine" vs. "der erwarteten").
const Value = ({ abs, pct, sub }) => (
  <span>
    {fmtInt(abs)}
    <br />
    <small className='text-muted' style={{ fontSize: 12 }}>
      {pct != null ? `${fmtPct(pct)}${sub ? ` ${sub}` : ''}` : ' '}
    </small>
  </span>
)

// "Ordination gesamt" headline figures for the 30-day window: each as an absolute
// count and, where meaningful, its share of the appropriate base.
export const PracticeTotals = ({ total, einschub = 0 }) => {
  const t = total || {}
  const base = t.total || 0
  const expected = t.expected || 0

  const ofTotal = __('reports.ofTotal')
  const ofExpected = __('reports.ofExpected')

  // Items are rendered left-to-right; an array is a pair kept together on one
  // line (Intern vereinbart + Online are complementary, together = all bookings).
  const items = [
    { label: __('reports.availableAppointments'), abs: t.slotsAvailable },
    { label: __('reports.bookedAppointments'), abs: t.slotsUsed, pct: t.calendarSlotUtilization, sub: __('reports.ofAvailable') },
    { label: __('reports.einschub'), abs: einschub, pct: ratio(einschub, base), sub: ofTotal },
    { label: __('reports.insurance'), abs: t.insurance, pct: ratio(t.insurance, base), sub: ofTotal },
    { label: __('reports.privateShort'), abs: t.private, pct: ratio(t.private, base), sub: ofTotal },
    [
      { label: __('reports.internalArranged'), abs: t.internal, pct: ratio(t.internal, base), sub: ofTotal },
      { label: __('reports.onlineAppointments'), abs: t.online, pct: ratio(t.online, base), sub: ofTotal }
    ],
    { label: __('reports.appeared'), abs: t.admitted, pct: ratio(t.admitted, expected), sub: ofExpected },
    { label: __('reports.noShow'), abs: t.noShow, pct: ratio(t.noShow, expected), sub: ofExpected }
  ]

  const renderTile = (tile, key) => (
    <Tile key={key} label={tile.label}>
      <Value abs={tile.abs} pct={tile.pct} sub={tile.sub} />
    </Tile>
  )

  return (
    <TileRow style={{ marginBottom: 0 }}>
      {items.map((item, i) => (
        Array.isArray(item)
          ? (
            <div key={i} style={{ display: 'flex', gap: 8, flex: '2 1 296px', minWidth: 0 }}>
              {item.map((tile, j) => renderTile(tile, j))}
            </div>
          )
          : renderTile(item, i)
      ))}
    </TileRow>
  )
}
