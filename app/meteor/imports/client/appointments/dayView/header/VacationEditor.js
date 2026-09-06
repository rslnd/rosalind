import React, { useState, useEffect } from 'react'
import moment from 'moment-timezone'
import Modal from 'react-bootstrap/lib/Modal'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { DayPickerRangeController } from 'react-dates'
import { START_DATE } from 'react-dates/constants'
import { __ } from '../../../../i18n'
import { Icon } from '../../../components/Icon'
import { HMTimeField } from '../../../components/form'
import { Users } from '../../../../api/users'

const reasonLabels = {
  vacation: 'Urlaub',
  compensatory: 'Zeitausgleich',
  sick: 'Krank'
}

const pad = hm => hm ? `${String(hm.h).padStart(2, '0')}:${String(hm.m || 0).padStart(2, '0')}` : ''

const matchingBoxStyle = {
  marginTop: 14,
  padding: 10,
  border: '1px solid #e1e4e8',
  borderRadius: 6,
  background: '#fafbfc',
  fontSize: 13
}

const matchingRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '2px 0'
}

const saveTooltipStyle = {
  position: 'absolute',
  bottom: '100%',
  right: 0,
  marginBottom: 8,
  padding: '6px 10px',
  background: '#333',
  color: '#fff',
  fontSize: 12,
  borderRadius: 4,
  whiteSpace: 'nowrap',
  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  zIndex: 10,
  pointerEvents: 'none'
}

// Native select – MUI's Select renders a portalled popover that mispositions
// under the app's body zoom factor, so we use a plain <select> here.
const nativeSelectStyle = {
  minWidth: 220,
  padding: '6px 8px',
  border: '1px solid #d2d6de',
  borderRadius: 3,
  fontSize: 14,
  background: '#fff'
}

// Modal to create or edit a vacation: date range picker, all-day checkbox,
// from/to times (when not all-day) and a reason. When no fixed `assignee` is
// given, a staff dropdown (`staff`) lets the user pick the person.
export const VacationEditor = ({ assignee, staff, date, vacation, existingVacations, onSave, onRemove, onClose }) => {
  // Clean range selection: no preselection for a new vacation, so the first
  // click picks a single day (start) and the next click extends it to a range.
  const [userId, setUserId] = useState((assignee && assignee._id) || (vacation && vacation.userId) || '')
  const [startDate, setStartDate] = useState(vacation ? moment(vacation.start) : null)
  const [endDate, setEndDate] = useState(vacation ? moment(vacation.end) : null)
  const [focusedInput, setFocusedInput] = useState(START_DATE)
  const [allDay, setAllDay] = useState(vacation ? !!vacation.allDay : true)
  const [from, setFrom] = useState(vacation && vacation.from ? vacation.from : { h: 8, m: 0 })
  const [to, setTo] = useState(vacation && vacation.to ? vacation.to : { h: 12, m: 0 })
  const [reason, setReason] = useState((vacation && vacation.reason) || 'vacation')
  const [saving, setSaving] = useState(false)
  const [showSaveTip, setShowSaveTip] = useState(false)

  // Safety net: react-bootstrap's Modal manager sometimes fails to restore the
  // body scroll lock (inline overflow:hidden + .modal-open) it sets while the
  // modal is open – especially when the modal is unmounted directly. Restore it
  // ourselves on unmount so the page stays scrollable.
  useEffect(() => () => {
    document.body.classList.remove('modal-open')
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }, [])

  // Why the save button is disabled (shown as an instant tooltip).
  const disabledReason = !userId
    ? 'Bitte zuerst eine MitarbeiterIn auswählen.'
    : !startDate
      ? 'Bitte einen Urlaubszeitraum im Kalender wählen.'
      : null
  const saveDisabled = saving || !!disabledReason

  const showStaffPicker = !assignee && staff && staff.length >= 1
  const title = assignee
    ? Users.methods.fullNameWithTitle(assignee)
    : (staff && staff.find(s => s._id === userId) || {}).name || 'Abwesenheit'

  // Highlight days already covered by an existing vacation of the selected
  // person (excluding the one currently being edited).
  const isDayHighlighted = (m) => {
    if (!userId) { return false }
    return (existingVacations || []).some(v =>
      v.userId === userId &&
      (!vacation || v._id !== vacation._id) &&
      m.isSameOrAfter(moment(v.start), 'day') &&
      m.isSameOrBefore(moment(v.end), 'day')
    )
  }

  const handleDatesChange = ({ startDate, endDate }) => {
    setStartDate(startDate)
    setEndDate(endDate)
  }

  const handleSave = () => {
    if (!startDate || !userId) { return }
    setSaving(true)
    Promise.resolve(onSave({
      scheduleId: vacation && vacation._id,
      userId,
      start: startDate.toDate(),
      end: (endDate || startDate).toDate(),
      allDay,
      from: allDay ? undefined : from,
      to: allDay ? undefined : to,
      reason
    })).then(onClose).catch(() => setSaving(false))
  }

  const handleRemove = () => {
    if (!vacation || !onRemove) { return }
    setSaving(true)
    Promise.resolve(onRemove(vacation._id)).then(onClose).catch(() => setSaving(false))
  }

  // Existing vacations of the selected person that overlap the marked range –
  // shown so the user can delete that period directly from the picker.
  const rangeStart = startDate ? moment(startDate).startOf('day') : null
  const rangeEnd = (endDate || startDate) ? moment(endDate || startDate).endOf('day') : null
  const matchingVacations = (userId && rangeStart && rangeEnd)
    ? (existingVacations || []).filter(v =>
        v.userId === userId &&
        (!vacation || v._id !== vacation._id) &&
        moment(v.start).isSameOrBefore(rangeEnd) &&
        moment(v.end).isSameOrAfter(rangeStart))
    : []

  const formatVacationRange = (v) => {
    const s = moment(v.start)
    const e = moment(v.end)
    const range = s.isSame(e, 'day')
      ? s.format('DD.MM.YYYY')
      : `${s.format('DD.MM.')}–${e.format('DD.MM.YYYY')}`
    const times = v.allDay ? 'ganztägig' : `${pad(v.from)}–${pad(v.to)}`
    return `${range} (${times})`
  }

  return (
    // Raised z-index so it sits above the month overview overlay (z-index 1200)
    // when opened from there.
    <Modal show enforceFocus={false} onHide={onClose} bsSize='large' style={{ zIndex: 1300 }}
      backdropStyle={{ zIndex: 1299 }}>
      <Modal.Header>
        <Modal.Title>
          Urlaub / Abwesenheit – {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showStaffPicker &&
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>MitarbeiterIn</label>
            <select value={userId} onChange={e => setUserId(e.target.value)} style={nativeSelectStyle}>
              <option value='' disabled>MitarbeiterIn wählen…</option>
              {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        }
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <DayPickerRangeController
            onDatesChange={handleDatesChange}
            onFocusChange={fi => setFocusedInput(fi || START_DATE)}
            focusedInput={focusedInput}
            startDate={startDate}
            endDate={endDate}
            minimumNights={0}
            initialVisibleMonth={() => moment(date)}
            isDayHighlighted={isDayHighlighted}
            hideKeyboardShortcutsPanel
            numberOfMonths={2}
          />
          <div style={{ flex: 1, minWidth: 220 }}>
            <FormControlLabel
              control={<Checkbox checked={allDay} onChange={e => setAllDay(e.target.checked)} />}
              label='Ganztägig'
            />
            {!allDay &&
              <div style={{ display: 'flex', gap: 12, marginTop: 8, marginBottom: 8 }}>
                <HMTimeField label='Von' value={from} onChange={setFrom} />
                <HMTimeField label='Bis' value={to} onChange={setTo} />
              </div>
            }
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Art</label>
              <select value={reason} onChange={e => setReason(e.target.value)} style={nativeSelectStyle}>
                {Object.keys(reasonLabels).map(r =>
                  <option key={r} value={r}>{reasonLabels[r]}</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {onRemove && matchingVacations.length >= 1 &&
          <div style={matchingBoxStyle}>
            <div style={{ marginBottom: 6, fontWeight: 'bold' }}>
              <Icon name='umbrella' /> Bereits eingetragener Urlaub im markierten Zeitraum:
            </div>
            {matchingVacations.map(v =>
              <div key={v._id} style={matchingRowStyle}>
                <span>{formatVacationRange(v)}</span>
                <Button size='small' style={{ color: 'red' }} disabled={saving} onClick={() => onRemove(v._id)}>
                  <Icon name='trash' />&nbsp;Löschen
                </Button>
              </div>
            )}
          </div>
        }
      </Modal.Body>
      <Modal.Footer>
        <div className='pull-left'>
          {vacation && onRemove &&
            <Button style={{ color: 'red' }} disabled={saving} onClick={handleRemove}>
              <Icon name='trash' />&nbsp;Löschen
            </Button>
          }
          <Button onClick={onClose}>{__('ui.close')}</Button>
        </div>
        <div className='pull-right'>
          <span
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setShowSaveTip(true)}
            onMouseLeave={() => setShowSaveTip(false)}>
            {disabledReason && showSaveTip &&
              <div style={saveTooltipStyle}>{disabledReason}</div>
            }
            <Button color='primary' disabled={saveDisabled} onClick={handleSave}>
              <Icon name='cog' spin={saving} /> {__('ui.save')}
            </Button>
          </span>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
