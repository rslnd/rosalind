import React from 'react'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import uniq from 'lodash/uniq'
import Alert from 'react-s-alert'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { Modal } from '../../components/bootstrap'
import { Icon } from '../../components/Icon'
import { withTracker } from '../../components/withTracker'
import { Schedules } from '../../../api/schedules'
import { Users } from '../../../api/users'
import { subscribe } from '../../../util/meteor/subscribe'
import { hasRole } from '../../../util/meteor/hasRole'
import { dateToDay, isSame } from '../../../util/time/day'
import { toWeekday } from '../../../util/time/weekdays'
import { invalidDefaultSchedules, describeDefaultSchedule } from '../../../api/schedules/methods/validateDefaultSchedule'
import { UserPicker } from '../../users/UserPicker'
import { WeekPlanPreview } from './WeekPlanPreview'

// Above the embedded month overview (zIndex 1200); nested modals go higher.
const Z_INDEX = 1400

// Quick planning from the day view or the month overview: apply the default
// schedule ("Wochenplan"), open or close online booking for some assignees
// (columns) on one day or a span of days.

export const ACTIONS = {
  applyDefault: {
    label: 'Wochenplan anwenden',
    hint: 'Ersetzt die geplanten Zeiten (Sperren, Pausen) und Online-Freigaben der ausgewählten Personen durch den Wochenplan. Online-Freigaben werden laut Wochenplan erstellt. Termine bleiben erhalten.',
    confirm: 'Wochenplan anwenden'
  },
  openBookable: {
    label: 'Online freigeben',
    hint: 'Gibt die gesamte offene Zeit der ausgewählten Spalten online frei (im Terminraster, ohne Sperren, Pausen, Urlaube und vergebene Termine). Geschlossene Tage werden übersprungen. Bestehende Online-Freigaben werden neu angelegt.',
    confirm: 'Online freigeben'
  },
  closeBookable: {
    label: 'Online-Freigaben entfernen',
    hint: 'Entfernt alle zukünftigen Online-Freigaben der ausgewählten Personen. Termine bleiben erhalten.',
    confirm: 'Online-Freigaben entfernen'
  }
}

const toInputValue = d => moment(d).format('YYYY-MM-DD')
const fromInputValue = s => moment(s, 'YYYY-MM-DD')

const today = () => moment().startOf('day')

// Quick date ranges. "This …" starts today, never in the past.
const PRESETS = [
  { key: 'thisWeek', label: 'Diese Woche', range: () => [today(), moment().endOf('isoWeek')] },
  { key: 'nextWeek', label: 'Nächste Woche', range: () => [moment().add(1, 'week').startOf('isoWeek'), moment().add(1, 'week').endOf('isoWeek')] },
  { key: 'thisMonth', label: 'Dieser Monat', range: () => [today(), moment().endOf('month')] },
  { key: 'thisQuarter', label: 'Dieses Quartal', range: () => [today(), moment().endOf('quarter')] },
  { key: 'nextQuarter', label: 'Nächstes Quartal', range: () => [moment().add(1, 'quarter').startOf('quarter'), moment().add(1, 'quarter').endOf('quarter')] }
]

const MAX_SKIPPED_SHOWN = 20

const composer = props => {
  const { calendar } = props
  const canEditSchedules = hasRole(Meteor.userId(), ['admin', 'schedules-edit'])
  const canEditBookables = hasRole(Meteor.userId(), ['bookables-edit'])

  if (canEditSchedules) { subscribe('schedules-default') }
  subscribe('schedules-holidays')

  const defaultSchedules = Schedules.find({
    type: 'default',
    calendarId: calendar._id,
    removed: { $ne: true }
  }).fetch()

  const holidays = Schedules.find({
    type: 'holiday',
    removed: { $ne: true }
  }).fetch()

  // Label of the holiday / closed day, or null when open
  const closedReason = m => {
    const h = holidays.find(h => h.day && isSame(h.day, dateToDay(m.toDate())))
    return h ? (h.note || 'Geschlossen') : null
  }

  return {
    ...props,
    defaultSchedules,
    closedReason,
    canEditSchedules,
    canEditBookables
  }
}

class QuickPlanModalComponent extends React.Component {
  constructor (props) {
    super(props)

    const from = moment.max(moment(props.from || today()).startOf('day'), today())
    const to = moment.max(moment(props.to || props.from || today()).startOf('day'), from)

    this.state = {
      action: props.action || (props.canEditSchedules ? 'applyDefault' : 'openBookable'),
      from,
      to,
      assigneeIds: props.assigneeIds || null, // null: default selection
      extraIds: [], // persons added via the picker
      pickerKey: 0,
      running: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  // The start never lies in the past, the end never before the start.
  setRange (from, to) {
    const f = moment.max(moment(from).startOf('day'), today())
    const t = moment.max(moment(to).startOf('day'), f)
    this.setState({ from: f, to: t })
  }

  // Days of the range that are not planned, with the reason. Like the server:
  // Sundays always, closed days / holidays unless removing online bookings.
  skippedDays () {
    const { action } = this.state
    return this.days().map(d => {
      if (d.isoWeekday() === 7) { return { day: d, reason: 'Sonntag' } }
      const closed = action !== 'closeBookable' && this.props.closedReason(d)
      return closed ? { day: d, reason: closed } : null
    }).filter(Boolean)
  }

  plannedDays () {
    const skipped = this.skippedDays().map(s => s.day.valueOf())
    return this.days().filter(d => !skipped.includes(d.valueOf()))
  }

  // Persons to choose from: the passed staff (eg. the day's columns) plus
  // everyone with a default schedule on one of the selected weekdays.
  staffIds () {
    const weekdaysInRange = uniq(this.plannedDays().map(d => toWeekday(d.toDate())))
    return uniq([
      ...(this.props.assigneeIds || []),
      ...(this.props.staffIds || []),
      ...this.state.extraIds,
      ...this.props.defaultSchedules
        .filter(d => weekdaysInRange.includes(d.weekday))
        .map(d => d.userId)
    ].filter(Boolean))
  }

  // Default selection: everyone listed, but when applying the default schedule
  // only persons that actually have one on these weekdays, so manually added
  // columns are not removed by accident.
  selectedIds () {
    if (this.state.assigneeIds) { return this.state.assigneeIds }
    if (this.state.action === 'applyDefault') {
      const weekdaysInRange = uniq(this.plannedDays().map(d => toWeekday(d.toDate())))
      return uniq(this.props.defaultSchedules
        .filter(d => weekdaysInRange.includes(d.weekday))
        .map(d => d.userId))
    }
    return this.staffIds()
  }

  // Add any person (eg. not working on the current day) and select them
  addAssignee (id) {
    if (!id) { return }
    const selected = this.selectedIds()
    this.setState(state => ({
      extraIds: uniq([...state.extraIds, id]),
      assigneeIds: uniq([...selected, id]),
      pickerKey: state.pickerKey + 1
    }))
  }

  toggleAssignee (id) {
    const selected = this.selectedIds()
    this.setState({
      assigneeIds: selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id]
    })
  }

  days () {
    const { from, to } = this.state
    const days = []
    if (!from.isValid() || !to.isValid() || to.isBefore(from)) { return days }
    const cursor = from.clone()
    while (cursor.isSameOrBefore(to, 'day') && days.length < 400) {
      days.push(cursor.clone())
      cursor.add(1, 'day')
    }
    return days
  }

  async handleSubmit () {
    const { calendar, onClose } = this.props
    const { action, from, to } = this.state
    const assigneeIds = this.selectedIds()

    this.setState({ running: true })

    const args = {
      calendarId: calendar._id,
      assigneeIds,
      from: from.clone().startOf('day').toDate(),
      to: to.clone().endOf('day').toDate()
    }

    try {
      if (action === 'applyDefault') {
        await Schedules.actions.applyDefaultSchedule.callPromise(args)
        Alert.success('Wochenplan angewendet')
      } else {
        const res = await Schedules.actions.setBookables.callPromise({
          ...args,
          bookable: action === 'openBookable'
        })
        if (res && action === 'openBookable') {
          const skipped = res.skipped.length
          Alert.success(`${res.created} Online-Freigaben erstellt` +
            (skipped ? ` (${skipped} × übersprungen: geschlossen, Urlaub, nicht eingeplant oder keine Öffnungszeiten)` : ''))
        } else if (res) {
          Alert.success(`${res.removed} Online-Freigaben entfernt`)
        }
      }
      onClose()
    } catch (e) {
      console.error(e)
      Alert.error(e.reason || e.message)
      this.setState({ running: false })
    }
  }

  render () {
    const { calendar, defaultSchedules, onClose, canEditSchedules, canEditBookables } = this.props
    const { action, from, to, running } = this.state
    const staffIds = this.staffIds()
    const selected = this.selectedIds()
    const days = this.days()
    const skipped = this.skippedDays()
    const plannedDays = this.plannedDays()
    const weekdaysInRange = uniq(plannedDays.map(d => toWeekday(d.toDate())))
    const activePreset = PRESETS.find(p => {
      const [f, t] = p.range()
      return moment.max(f, today()).isSame(from, 'day') && t.isSame(to, 'day')
    })

    const name = id => {
      const u = Users.findOne({ _id: id }, { removed: true })
      return u ? Users.methods.fullNameWithTitle(u) : id
    }

    const selectedDefaults = defaultSchedules.filter(d =>
      selected.includes(d.userId) && weekdaysInRange.includes(d.weekday))

    const invalid = action === 'applyDefault'
      ? invalidDefaultSchedules({ calendar, defaultSchedules: defaultSchedules.filter(d => selected.includes(d.userId)) })
      : []

    // Applying the default schedule removes the columns of persons without
    // planned times on these weekdays.
    const withoutDefaults = action === 'applyDefault'
      ? selected.filter(id => !selectedDefaults.some(d => d.userId === id))
      : []

    const availableActions = Object.keys(ACTIONS).filter(a =>
      a === 'applyDefault' ? canEditSchedules : (canEditSchedules || canEditBookables))

    const canSubmit = !running &&
      plannedDays.length >= 1 &&
      selected.length >= 1 &&
      invalid.length === 0

    const rangeLabel = days.length === 1
      ? from.format('dd., D. MMMM YYYY')
      : `${from.format('dd., D.M.')} – ${to.format('dd., D.M.YYYY')}`

    return (
      <Modal
        show
        enforceFocus={false}
        onHide={onClose}
        bsSize='large'
        style={{ zIndex: Z_INDEX }}
        backdropStyle={{ zIndex: Z_INDEX - 1 }}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 18 }}>
            <Icon name='magic' />&nbsp;Schnellplanung <span style={{ color: '#888', fontWeight: 'normal' }}>– {rangeLabel}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={sectionStyle}>
            {availableActions.map(a =>
              <label key={a} style={radioLabelStyle}>
                <input
                  type='radio'
                  name='quickPlanAction'
                  checked={action === a}
                  onChange={() => this.setState({ action: a })} />
                &nbsp;{ACTIONS[a].label}
              </label>
            )}
            <p style={hintStyle}>{ACTIONS[action].hint}</p>
          </div>

          <div style={{ ...sectionStyle, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PRESETS.map(p =>
              <Button
                key={p.key}
                size='small'
                variant={activePreset === p ? 'contained' : 'outlined'}
                color={activePreset === p ? 'primary' : 'default'}
                style={presetButtonStyle}
                onClick={() => this.setRange(...p.range())}>
                {p.label}
              </Button>
            )}
          </div>

          <div style={{ ...sectionStyle, display: 'flex', gap: 16, alignItems: 'center' }}>
            <label style={fieldLabelStyle}>
              Von
              <input
                type='date'
                style={inputStyle}
                value={toInputValue(from)}
                min={toInputValue(today())}
                onChange={e => e.target.value && this.setRange(fromInputValue(e.target.value), to)} />
            </label>
            <label style={fieldLabelStyle}>
              Bis
              <input
                type='date'
                style={inputStyle}
                value={toInputValue(to)}
                min={toInputValue(from)}
                onChange={e => e.target.value && this.setRange(from, fromInputValue(e.target.value))} />
            </label>
            <span style={{ color: '#888', marginTop: 16 }}>
              <b style={{ color: '#333' }}>{plannedDays.length}</b> {plannedDays.length === 1 ? 'Tag wird' : 'Tage werden'} geplant
              {skipped.length > 0 && <>, {skipped.length} übersprungen</>}
            </span>
          </div>

          {skipped.length > 0 &&
            <div style={{ ...sectionStyle, marginTop: -6 }}>
              <span style={{ fontSize: 12, color: '#888' }}>Übersprungen: </span>
              {skipped.slice(0, MAX_SKIPPED_SHOWN).map(({ day, reason }) =>
                <span
                  key={day.valueOf()}
                  style={reason === 'Sonntag' ? skippedChipStyle : { ...skippedChipStyle, ...closedChipStyle }}
                  title={reason}>
                  {day.format('dd D.M.')} {reason !== 'Sonntag' && <>· {reason}</>}
                </span>
              )}
              {skipped.length > MAX_SKIPPED_SHOWN &&
                <span style={{ fontSize: 12, color: '#888' }}> und {skipped.length - MAX_SKIPPED_SHOWN} weitere</span>}
            </div>
          }

          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>Personen</b>
              <Button
                size='small'
                onClick={() => this.setState({ assigneeIds: selected.length === staffIds.length ? [] : staffIds })}>
                {selected.length === staffIds.length ? 'Alle abwählen' : 'Alle auswählen'}
              </Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {staffIds.map(id =>
                <FormControlLabel
                  key={id}
                  style={{ width: '33%', margin: 0 }}
                  control={
                    <Checkbox
                      size='small'
                      style={{ padding: 3 }}
                      checked={selected.includes(id)}
                      onChange={() => this.toggleAssignee(id)} />
                  }
                  label={<span style={{ fontSize: 13 }}>{name(id)}</span>}
                />
              )}
            </div>
            <div style={{ marginTop: 6, maxWidth: 360 }}>
              <UserPicker
                key={this.state.pickerKey}
                placeholder='Weitere Person hinzufügen…'
                filter={u => !staffIds.includes(u._id)}
                onChange={id => this.addAssignee(id)}
              />
            </div>
          </div>

          {action !== 'closeBookable' && selected.length >= 1 &&
            <div style={sectionStyle}>
              <b>Wochenplan</b>
              <span style={hintStyle}>
                &nbsp;{action === 'applyDefault'
                  ? '– wird auf die ausgewählten Tage angewendet. Klick auf eine Zeit zum Bearbeiten, Änderungen gelten dauerhaft.'
                  : '– Öffnungszeiten für Spalten ohne geplante Zeiten. Online freigegeben wird nur an Tagen, an denen die Person eingeplant ist.'}
              </span>
              <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 4 }}>
                <WeekPlanPreview
                  calendar={calendar}
                  defaultSchedules={defaultSchedules}
                  userIds={selected}
                  weekdays={weekdaysInRange}
                  name={name}
                  zIndex={Z_INDEX + 10}
                />
              </div>
            </div>
          }

          {invalid.length >= 1 &&
            <div style={errorBoxStyle}>
              <b><Icon name='exclamation-triangle' /> Wochenplan passt nicht ins Terminraster</b>
              <ul style={{ margin: '6px 0 6px 18px', padding: 0 }}>
                {invalid.map(({ schedule, problems }) =>
                  <li key={schedule._id}>
                    {name(schedule.userId)} {describeDefaultSchedule(schedule)}: {problems.join(', ')}
                  </li>
                )}
              </ul>
              <a href={`/schedules/default/${calendar.slug}`}>Wochenplan korrigieren</a>
            </div>
          }

          {withoutDefaults.length >= 1 &&
            <div style={warningBoxStyle}>
              <Icon name='exclamation-triangle' /> Kein Wochenplan an diesen Tagen für <b>{withoutDefaults.map(name).join(', ')}</b>: wird nicht eingeplant, eine vorhandene Spalte wird entfernt. Mit <Icon name='plus' /> im Wochenplan oben Zeiten hinzufügen.
            </div>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button size='small' onClick={onClose}>Abbrechen</Button>
          &nbsp;
          <Button
            size='small'
            variant='contained'
            color={action === 'closeBookable' ? 'secondary' : 'primary'}
            disabled={!canSubmit}
            onClick={this.handleSubmit}>
            <Icon name={running ? 'cog' : 'check'} spin={running} />&nbsp;{ACTIONS[action].confirm}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

const sectionStyle = { marginBottom: 14 }
const presetButtonStyle = { textTransform: 'none', padding: '2px 10px' }
const skippedChipStyle = {
  display: 'inline-block',
  fontSize: 11,
  padding: '1px 6px',
  margin: '2px 4px 2px 0',
  borderRadius: 10,
  background: '#f0f0f0',
  color: '#666',
  whiteSpace: 'nowrap'
}
const closedChipStyle = { background: '#f9edee', color: '#a4271b' }
const radioLabelStyle = { display: 'block', fontWeight: 'normal', cursor: 'pointer', marginBottom: 2 }
const hintStyle = { color: '#888', fontSize: 12, margin: '4px 0 0 0' }
const fieldLabelStyle = { display: 'flex', flexDirection: 'column', fontWeight: 'normal', fontSize: 12, color: '#555' }
const inputStyle = { padding: '4px 6px', border: '1px solid #d2d6de', borderRadius: 3, fontSize: 14 }
const errorBoxStyle = {
  background: '#fdecea', color: '#a4271b', border: '1px solid #f5c6cb',
  borderRadius: 4, padding: '8px 10px', fontSize: 12, marginBottom: 8
}
const warningBoxStyle = {
  background: '#fff3cd', color: '#6E5221', border: '1px solid #ffe8a1',
  borderRadius: 4, padding: '8px 10px', fontSize: 12
}

export const QuickPlanModal = withTracker(composer)(QuickPlanModalComponent)
