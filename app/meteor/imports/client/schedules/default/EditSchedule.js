import React from 'react'
import Alert from 'react-s-alert'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { Modal } from '../../components/bootstrap'
import { Icon } from '../../components/Icon'
import { HMTimeField } from '../../components/form'
import { Schedules } from '../../../api/schedules'
import { __ } from '../../../i18n'
import { defaultScheduleProblems } from '../../../api/schedules/methods/validateDefaultSchedule'
import identity from 'lodash/identity'
import { HMRangeToString } from '../../../util/time/hm'

export const HMRangeToStringWithRoles = (schedule) => {
  if (!schedule || !schedule.from) { return '' }

  const { from, to, note, roles } = schedule
  return [
    HMRangeToString({ from, to, note }),
    roles ? roles.map(r => `role-${r}`).join(' ') : null
  ].filter(identity).join(' ')
}

// Insert (no _id), update or delete (newSchedule: null) a default schedule block
export const saveDefaultSchedule = ({ _id, assigneeId, weekday, calendarId }) => newSchedule => {
  const call = _id
    ? Schedules.actions.upsertDefaultSchedule.callPromise({ newSchedule, scheduleId: _id })
    : (newSchedule
      ? Schedules.actions.upsertDefaultSchedule.callPromise({ newSchedule, weekday, userId: assigneeId, calendarId })
      : Promise.resolve())
  return call.catch(err => { Alert.error(err.reason || __('ui.error')); console.error(err) })
}

// Modal to add / edit / delete one block of the default schedule ("Wochenplan").
// Pass zIndex when opened on top of another modal or overlay.
export class EditSchedule extends React.Component {
  constructor (props) {
    super(props)

    const s = this.props.schedule || {}

    // Roles are still encoded as `role-x` tokens inside the note (preserving the
    // existing convention); show them back in the note field for editing.
    const note = [
      s.note || '',
      (s.roles || []).map(r => `role-${r}`).join(' ')
    ].filter(Boolean).join(' ').trim()

    this.state = {
      from: s.from || { h: 8, m: 0 },
      to: s.to || { h: 12, m: 0 },
      note,
      bookable: !!s.bookable,
      // A block is a "Pause" (blocking, non-working) when it is not available.
      // available is derived server-side from the note, so we mirror it here.
      pause: s.available === false
    }

    this.handleSave = this.handleSave.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleTogglePause = this.handleTogglePause.bind(this)
  }

  handleTogglePause (checked) {
    // A pause can't be online bookable.
    this.setState(state => ({ pause: checked, bookable: checked ? false : state.bookable }))
  }

  handleSave (e) {
    if (e && e.preventDefault) { e.preventDefault() }

    const { from, to, note, bookable, pause } = this.state

    if (!from || !to) {
      this.props.onChange(null)
      return
    }

    // Extract role-x tokens from the note (existing convention).
    const regex = /role-[a-zA-Z0-9-]+/g
    const roles = (note && note.match(regex))
      ? note.match(regex).map(r => r.replace(/^role-/, ''))
      : undefined
    let remainingNote = note ? note.replace(regex, '').trim() : ''

    // A "Pause" is represented by a note without '!' (server sets available:false).
    // Guarantee that by stripping any '!' and defaulting the label to "Pause".
    if (pause) {
      remainingNote = (remainingNote.replace(/!/g, '').trim()) || 'Pause'
    }

    this.props.onChange({
      from,
      to,
      note: remainingNote || undefined,
      roles,
      bookable: pause ? false : bookable
    })
  }

  handleDelete () {
    this.props.onChange(null)
  }

  render () {
    const { onCancel, schedule, title, calendar, zIndex } = this.props
    const { from, to, note, bookable, pause } = this.state
    const problems = defaultScheduleProblems({ calendar, schedule: { from, to } })

    return (
      <Modal
        show
        enforceFocus={false}
        onHide={onCancel}
        bsSize='small'
        style={zIndex ? { zIndex } : undefined}
        backdropStyle={zIndex ? { zIndex: zIndex - 1 } : undefined}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 18 }}>
            {schedule ? 'Zeit bearbeiten' : 'Zeit hinzufügen'}
            {title && <span style={{ color: '#888', fontWeight: 'normal' }}> – {title}</span>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <HMTimeField label='Von' value={from} onChange={v => this.setState({ from: v })} />
            <HMTimeField label='Bis' value={to} onChange={v => this.setState({ to: v })} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={pause}
                  onChange={e => this.handleTogglePause(e.target.checked)}
                  style={{ padding: 4 }}
                />
              }
              label='Pause / Sperre'
              style={{ marginLeft: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={bookable}
                  onChange={e => this.setState({ bookable: e.target.checked })}
                  disabled={pause}
                  style={{ padding: 4 }}
                />
              }
              label='Online buchbar'
              style={{ marginLeft: 0 }}
            />
          </div>

          <TextField
            fullWidth
            label={pause ? 'Bezeichnung' : 'Notiz (optional)'}
            placeholder={pause ? 'z. B. Pause' : ''}
            value={note}
            onChange={e => this.setState({ note: e.target.value })}
            InputLabelProps={{ shrink: true }}
            style={{ marginTop: 8 }}
          />

          {problems.length >= 1 &&
            <div style={{ marginTop: 12, color: '#c0392b', fontSize: 13 }}>
              {problems.map(p => <div key={p}><Icon name='exclamation-triangle' /> {p}</div>)}
            </div>
          }
        </Modal.Body>
        <Modal.Footer>
          <div className='pull-left'>
            {schedule &&
              <Button size='small' style={{ color: 'red' }} onClick={this.handleDelete}>
                <Icon name='trash' />&nbsp;Löschen
              </Button>
            }
          </div>
          <Button size='small' onClick={onCancel}>Abbrechen</Button>
          &nbsp;
          <Button size='small' variant='contained' color='primary' disabled={problems.length >= 1} onClick={this.handleSave}>
            <Icon name='check' />&nbsp;Speichern
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
