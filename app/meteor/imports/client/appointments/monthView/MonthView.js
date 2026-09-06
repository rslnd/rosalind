import React, { useState } from 'react'
import moment from 'moment-timezone'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { Icon } from '../../components/Icon'
import { prompt } from '../../layout/Prompt'
import { VacationEditor } from '../dayView/header/VacationEditor'
import { primary, primaryActive, warning, red, green, gray } from '../../layout/styles'

// Icon with hover / active colors (inline styles can't express :hover).
const HoverIcon = ({ name, title, onClick, base = '#888', hover = primary, active = primaryActive, style }) => {
  const [isHover, setHover] = useState(false)
  const [isActive, setActive] = useState(false)
  const color = isActive ? active : (isHover ? hover : base)
  return (
    <span
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false) }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{ cursor: 'pointer', color, ...style }}>
      <Icon name={name} />
    </span>
  )
}

const weekdayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const LAYERS = [
  { key: 'attendees', label: 'Anwesenheiten' },
  { key: 'utilization', label: 'Auslastung' },
  { key: 'vacations', label: 'Urlaube' },
  { key: 'holidays', label: 'Feiertage' },
  { key: 'notes', label: 'Tagesnotizen' },
  { key: 'deviations', label: 'Abweichungen' },
  { key: 'warningsOnly', label: 'Nur Warnungen' }
]

const pad = hm => `${String(hm.h).padStart(2, '0')}:${String(hm.m || 0).padStart(2, '0')}`

const cellStyle = {
  border: `1px solid ${gray}`,
  height: 118,
  padding: 4,
  verticalAlign: 'top',
  fontSize: 11,
  width: '14.28%',
  boxSizing: 'border-box',
  position: 'relative',
  overflow: 'hidden'
}

const dayNumberStyle = (data) => ({
  fontWeight: 'bold',
  color: data.isSunday ? '#bbb' : '#333',
  cursor: 'pointer'
})

const UtilizationBar = ({ value }) => (
  <div title={`Auslastung ${Math.round(value * 100)}%`} style={{ marginTop: 3 }}>
    <div style={{ height: 5, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.round(value * 100)}%`,
        height: '100%',
        background: value > 0.9 ? red : (value > 0.6 ? warning : green)
      }} />
    </div>
    <div style={{ color: '#888', fontSize: 10 }}>{Math.round(value * 100)}%</div>
  </div>
)

const DayActions = ({ data, onAddVacation, onToggleClosed }) => (
  <div style={dayActionsStyle} className='month-day-actions'>
    <HoverIcon
      name='umbrella'
      title='Urlaub eintragen'
      onClick={(e) => { e.stopPropagation(); onAddVacation(data) }}
    />
    <HoverIcon
      name={data.holiday ? 'lock' : 'unlock'}
      title={data.holiday ? 'Praxis wieder öffnen' : 'Praxis schließen'}
      base={data.holiday ? red : '#888'}
      hover={data.holiday ? '#e74c3c' : primary}
      active={data.holiday ? '#c0392b' : primaryActive}
      onClick={(e) => { e.stopPropagation(); onToggleClosed(data) }}
    />
  </div>
)

const DayCell = ({ data, filters, onSelectDay, onAddVacation, onEditVacation, onToggleClosed }) => {
  if (!data) { return <td style={{ ...cellStyle, background: '#f8f9f9', height: cellStyle.height }} /> }

  const hasWarnings = data.warnings.length >= 1
  if (filters.warningsOnly && !hasWarnings) {
    return <td style={{ ...cellStyle, opacity: 0.3, cursor: 'pointer' }} onClick={() => onSelectDay(data)}>
      <div style={dayNumberStyle(data)}>{moment(data.date).date()}</div>
    </td>
  }

  const style = {
    ...cellStyle,
    cursor: 'pointer',
    ...(data.holiday && filters.holidays ? { background: '#f9edee' } : {}),
    ...(data.deviation && filters.deviations ? { borderLeft: `3px solid ${warning}` } : {})
  }

  return (
    <td style={style} onClick={() => onSelectDay(data)} title='Zur Tagesansicht'>
      <DayActions data={data} onAddVacation={onAddVacation} onToggleClosed={onToggleClosed} />

      <div style={dayNumberStyle(data)}>
        {moment(data.date).date()}
        {hasWarnings &&
          <span title={data.warnings.map(w => w.message).join('\n')} style={{ marginLeft: 6, color: red }}>
            <Icon name='exclamation-triangle' /> {data.warnings.length}
          </span>
        }
      </div>

      {filters.holidays && data.holiday &&
        <div style={{ color: red }}><Icon name='lock' /> {data.holiday.note || 'Geschlossen'}</div>
      }

      {filters.attendees && data.attendees.length >= 1 &&
        <div style={{ color: '#333', marginTop: 2 }}>
          {data.attendees.map(a => a.name).join(', ')}
        </div>
      }

      {filters.vacations && data.vacations.map(v =>
        <div
          key={v._id}
          style={{ ...vacationChip, cursor: 'pointer' }}
          title='Urlaub bearbeiten / löschen'
          onClick={(e) => { e.stopPropagation(); onEditVacation(v, data) }}>
          <Icon name='umbrella' /> {v.userName}{!v.allDay && v.from ? ` ${pad(v.from)}–${pad(v.to)}` : ''}
        </div>
      )}

      {filters.notes && data.note &&
        <div style={{ color: '#555', marginTop: 2, fontStyle: 'italic' }}>
          <Icon name='sticky-note-o' /> {data.note}
        </div>
      }

      {filters.utilization && data.utilization !== null &&
        <UtilizationBar value={data.utilization} />
      }
    </td>
  )
}

export const MonthView = (props) => {
  const {
    calendar, monthMoment, dayData, staff, isReady, existingVacations,
    embedded, onClose, onSelectDay, onChangeMonth,
    onSaveVacation, onRemoveVacation, onSetDayClosed
  } = props

  const [filters, setFilters] = useState({
    attendees: true,
    utilization: true,
    vacations: true,
    holidays: true,
    notes: true,
    deviations: true,
    warningsOnly: false
  })
  const [vacationDay, setVacationDay] = useState(null) // day data for which to add a vacation
  const [vacationEdit, setVacationEdit] = useState(null) // { vacation, date } to edit/delete
  const [showWarnings, setShowWarnings] = useState(true)

  if (!calendar) { return null }

  const toggle = key => setFilters(f => ({ ...f, [key]: !f[key] }))

  const handleSelectDay = (data) => {
    if (onSelectDay) { onSelectDay(moment(data.date).format('YYYY-MM-DD')) }
  }

  const handleAddVacation = (data) => setVacationDay(data)
  const handleEditVacation = (vacation, data) => setVacationEdit({ vacation, date: data.date })

  const handleToggleClosed = async (data) => {
    // Reopen immediately.
    if (data.holiday) {
      onSetDayClosed(data.day, false)
      return
    }
    const dateStr = moment(data.date).format('dddd, DD.MM.YYYY')
    const n = data.appointmentCount
    const apptTxt = data.hasAppointments
      ? (n === 1 ? ' Es ist noch 1 Termin vergeben.' : ` Es sind noch ${n} Termine vergeben.`)
      : ''
    const ok = await prompt({
      title: <span style={{ fontSize: 20, fontWeight: 'bold' }}>Praxis schließen</span>,
      body: `Soll die Praxis am ${dateStr} wirklich als geschlossen markiert werden?${apptTxt}`,
      confirm: 'Ja, schließen',
      cancel: 'Abbrechen'
    })
    if (ok) { onSetDayClosed(data.day, true) }
  }

  // Calendar grid: leading blanks so the 1st lands under its weekday.
  const firstWeekday = (monthMoment.clone().startOf('month').isoWeekday()) - 1 // 0=Mon
  const cells = [...Array(firstWeekday).fill(null), ...dayData]
  while (cells.length % 7 !== 0) { cells.push(null) }
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) { weeks.push(cells.slice(i, i + 7)) }

  const totalWarnings = dayData.reduce((n, d) => n + d.warnings.length, 0)
  const allWarnings = dayData.reduce((acc, d) =>
    acc.concat(d.warnings.map(w => ({ ...w, data: d }))), [])

  const body = (
    <div>
      <div style={toolbarStyle}>
        <HoverIcon name='chevron-left' base={primary} style={navBtnStyle} onClick={() => onChangeMonth && onChangeMonth(-1)} />
        <span style={{ fontWeight: 'bold', fontSize: 18, minWidth: 170, textAlign: 'center' }}>
          {monthMoment.clone().format('MMMM YYYY')}
        </span>
        <HoverIcon name='chevron-right' base={primary} style={navBtnStyle} onClick={() => onChangeMonth && onChangeMonth(1)} />

        <div style={{ marginLeft: 16, display: 'flex', flexWrap: 'wrap', flex: 1 }}>
          {LAYERS.map(l =>
            <FormControlLabel
              key={l.key}
              control={<Checkbox size='small' style={{ padding: 3 }} checked={filters[l.key]} onChange={() => toggle(l.key)} />}
              label={<span style={{ fontSize: 12 }}>{l.label}</span>}
              style={{ marginRight: 8, marginLeft: 0 }}
            />
          )}
        </div>

        {embedded &&
          <HoverIcon name='times' title='Schließen' base={primary} style={{ ...navBtnStyle, fontSize: 22 }} onClick={onClose} />
        }
      </div>

      {totalWarnings > 0 &&
        <div style={warningPanelStyle}>
          <div style={warningBannerStyle} onClick={() => setShowWarnings(s => !s)}>
            <span>
              <Icon name='exclamation-triangle' /> {totalWarnings} Warnung(en) in diesem Monat
            </span>
            <span><Icon name={showWarnings ? 'chevron-up' : 'chevron-down'} /></span>
          </div>
          {showWarnings &&
            <ul style={warningListStyle}>
              {allWarnings.map((w, i) =>
                <li
                  key={i}
                  style={warningItemStyle}
                  title='Zum Tag springen'
                  onClick={() => handleSelectDay(w.data)}>
                  <Icon name='exclamation-triangle' /> {w.message}
                </li>
              )}
            </ul>
          }
        </div>
      }

      {!isReady && <p><Icon name='cog' spin /> Lädt…</p>}

      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr>
            {weekdayLabels.map(w => <th key={w} style={{ border: `1px solid ${gray}`, padding: 4, fontSize: 12 }}>{w}</th>)}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) =>
            <tr key={i}>
              {week.map((d, j) =>
                <DayCell
                  key={j}
                  data={d}
                  filters={filters}
                  onSelectDay={handleSelectDay}
                  onAddVacation={handleAddVacation}
                  onEditVacation={handleEditVacation}
                  onToggleClosed={handleToggleClosed}
                />
              )}
            </tr>
          )}
        </tbody>
      </table>

      {vacationDay &&
        <VacationEditor
          staff={staff}
          date={vacationDay.date}
          existingVacations={existingVacations}
          onSave={(v) => onSaveVacation(v)}
          onRemove={onRemoveVacation}
          onClose={() => setVacationDay(null)}
        />
      }

      {vacationEdit &&
        <VacationEditor
          staff={staff}
          date={vacationEdit.date}
          vacation={vacationEdit.vacation}
          existingVacations={existingVacations}
          onSave={(v) => onSaveVacation(v)}
          onRemove={onRemoveVacation}
          onClose={() => setVacationEdit(null)}
        />
      }
    </div>
  )

  if (embedded) {
    return (
      <div style={overlayBackdropStyle} onClick={onClose}>
        <div style={overlayPanelStyle} onClick={e => e.stopPropagation()}>
          <div className='content-header' style={{ position: 'static' }}>
            <h1 style={{ margin: 0 }}>Monatsübersicht <b>{calendar.name}</b></h1>
          </div>
          {body}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='content-header'><h1>Monatsübersicht <b>{calendar.name}</b></h1></div>
      <div className='content'>{body}</div>
    </div>
  )
}

const toolbarStyle = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }
const navBtnStyle = { fontSize: 18, padding: '0 8px', cursor: 'pointer' }
const warningPanelStyle = { marginBottom: 10 }
const warningBannerStyle = {
  background: '#fdecea', color: '#a4271b', border: '1px solid #f5c6cb',
  borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
}
const warningListStyle = {
  listStyle: 'none', margin: '6px 0 0 0', padding: 0,
  maxHeight: 180, overflowY: 'auto',
  border: '1px solid #f5c6cb', borderRadius: 4
}
const warningItemStyle = {
  padding: '6px 10px', borderBottom: '1px solid #f7d9dc',
  color: '#a4271b', fontSize: 12, cursor: 'pointer', lineHeight: 1.4
}
const vacationChip = {
  color: '#6E5221', background: '#fff3cd', borderRadius: 3, padding: '1px 3px', marginTop: 2
}
const dayActionsStyle = {
  position: 'absolute', top: 2, right: 2, display: 'flex', gap: 6, fontSize: 13
}
const overlayBackdropStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.4)', zIndex: 1200,
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: 20
}
const overlayPanelStyle = {
  background: '#fff', borderRadius: 6, padding: 16,
  width: '95%', maxWidth: 1200, boxShadow: '0 6px 40px rgba(0,0,0,0.3)'
}
