import React from 'react'
import uniq from 'lodash/uniq'
import sortBy from 'lodash/fp/sortBy'
import identity from 'lodash/identity'
import { Calendars } from '../../../api/calendars'
import { Schedules } from '../../../api/schedules'
import { weekdays } from '../../../util/time/weekdays'
import { Users } from '../../../api/users'
import { Box } from '../../components/Box'
import { UserPicker } from '../../users/UserPicker'
import { __ } from '../../../i18n'
import { withTracker } from '../../components/withTracker'
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from '../../components/Table'
import { Icon } from '../../components/Icon'
import Modal from 'react-bootstrap/lib/Modal'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { HMTimeField } from '../../components/form'
import { ApplyDefaultSchedule } from './ApplyDefaultSchedule'
import { subscribe } from '../../../util/meteor/subscribe'
import { HMtoString, HMRangeToString } from '../../../util/time/hm'

const HMRangeToStringWithRoles = (schedule) => {
  if (!schedule || !schedule.from) { return '' }

  const { from, to, note, roles } = schedule
  return [
    HMRangeToString({ from, to, note }),
    roles ? roles.map(r => `role-${r}`).join(' ') : null
  ].filter(identity).join(' ')
}

const composer = props => {
  const { slug } = props.match.params
  const calendar = Calendars.findOne({ slug })

  if (!calendar) {
    return { isLoading: true }
  }

  const users = Users.find({}).fetch()

  subscribe('schedules-default')

  const defaultSchedules = Schedules.find({
    type: 'default',
    calendarId: calendar._id,
    removed: { $ne: true }
  }).fetch()

  return {
    calendar,
    users,
    defaultSchedules
  }
}

class SchedulesDefaultScreenComponent extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      edit: null
    }

    this.assignees = this.assignees.bind(this)
    this.renderSchedules = this.renderSchedules.bind(this)
    this.handleAddAssignee = this.handleAddAssignee.bind(this)
    this.handleAddScheduleWeekday = this.handleAddScheduleWeekday.bind(this)
    this.handleStartEdit = this.handleStartEdit.bind(this)
    this.handleEndEdit = this.handleEndEdit.bind(this)
    this.handleSaveEdit = this.handleSaveEdit.bind(this)
  }

  assignees () {
    return uniq([
      ...this.props.defaultSchedules.map(s => s.userId),
      this.state.edit && this.state.edit.assigneeId
    ].filter(identity)).map(assigneeId =>
      this.props.users.find(u => u._id === assigneeId)
    ).filter(identity) // there might exist default schedules for deleted users
  }

  handleAddAssignee (assigneeId) {
    this.setState({
      edit: {
        assigneeId,
        isNewAssignee: true
      }
    })
  }

  handleAddScheduleWeekday ({ weekday, assigneeId }) {
    return () =>
      this.setState({
        edit: {
          weekday,
          assigneeId
        }
      })
  }

  handleStartEdit (scheduleId) {
    return () =>
      this.setState({
        edit: {
          scheduleId
        }
      })
  }

  handleSaveEdit ({ _id, assigneeId, weekday }) {
    return newSchedule => {
      if (_id && newSchedule) {
        console.log('update schedule id', _id, newSchedule)
        Schedules.actions.upsertDefaultSchedule.callPromise({
          newSchedule,
          scheduleId: _id
        })
      } else if (!newSchedule && _id) {
        console.log('deleting schedule', _id)
        Schedules.actions.upsertDefaultSchedule.callPromise({
          newSchedule,
          scheduleId: _id
        })
      } else if (newSchedule && !_id) {
        console.log('inserting new schedule', { newSchedule, assigneeId, weekday })
        Schedules.actions.upsertDefaultSchedule.callPromise({
          newSchedule,
          weekday,
          userId: assigneeId,
          calendarId: this.props.calendar._id
        })
      }

      this.handleEndEdit()
    }
  }

  handleEndEdit () {
    this.setState({
      edit: null
    })
  }

  renderSchedules ({ weekday, assigneeId }) {
    const schedules = sortBy(s => HMtoString(s.from))(this.props.defaultSchedules.filter(s =>
      s.userId === assigneeId &&
      s.weekday === weekday
    ))

    const assignee = this.props.users.find(u => u._id === assigneeId)
    const editTitle = [
      assignee && Users.methods.fullNameWithTitle(assignee),
      __(`time.${weekday}`)
    ].filter(identity).join(' · ')

    const isAddingSchedule =
      this.state.edit &&
      this.state.edit.weekday === weekday &&
      this.state.edit.assigneeId === assigneeId

    const isEditingSchedule = scheduleId =>
      this.state.edit &&
      this.state.edit.scheduleId === scheduleId

    const canAddSchedule =
      !this.state.edit || this.state.edit.isNewAssignee

    return <div>
      {
        schedules.map(s =>
          <div key={s._id}>
            {
              isEditingSchedule(s._id)
                ? (
                  <EditSchedule
                    schedule={s}
                    title={editTitle}
                    onChange={this.handleSaveEdit(s)}
                    onCancel={this.handleEndEdit}
                  />
                ) : (
                  <Button
                    size='medium'
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      textTransform: 'none',
                      color: s.note && s.note.includes("!") ? "red" : "inherit",
                      opacity: s.available === false ? 0.6 : 1
                    }}
                    onClick={this.handleStartEdit(s._id)}>
                      {HMRangeToStringWithRoles(s)}
                      {s.bookable && <>&nbsp;<Icon name='globe' title='Online buchbar' /></>}
                  </Button>
                )
            }
          </div>
        )
      }

      {
        isAddingSchedule
          ? (
            <EditSchedule
              title={editTitle}
              onChange={this.handleSaveEdit({ weekday, assigneeId })}
              onCancel={this.handleEndEdit}
            />
          ) : (
            canAddSchedule && <Button style={{ width: '100%' }} onClick={this.handleAddScheduleWeekday({ weekday, assigneeId })}>
              <Icon style={{ opacity: 0.1 }} name='plus' />
            </Button>
          )

      }

    </div>
  }

  render () {
    const {
      calendar
    } = this.props

    return (
      <div>
        <div className='content-header'>
          <h1>Arbeitszeiten festlegen für <b>{calendar.name}</b></h1>
        </div>
        <div className='content'>
          <Box title='Standardwoche planen' icon='calendar-o' noPadding>
            <Table style={{ overflow: 'visible' }} tableStyle={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell>{/* */}</TableCell>
                  {
                    weekdays.map(weekday =>
                      <TableCell key={weekday} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {__(`time.${weekday}`)}
                      </TableCell>
                    )
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  this.assignees().filter(identity).map(assignee =>
                    <TableRow key={assignee._id}>
                      <TableCell>
                        {Users.methods.fullNameWithTitle(assignee)}
                      </TableCell>
                      {
                        weekdays.map(weekday =>
                          <TableCell key={weekday}>{
                            this.renderSchedules({
                              assigneeId: assignee._id,
                              weekday
                            })
                          }</TableCell>
                        )
                      }
                    </TableRow>
                  )
                }

                <TableRow>
                  <TableCell colSpan={3}>
                    <UserPicker
                      onChange={this.handleAddAssignee}
                      placeholder='MitarbeiterIn hinzufügen'
                    />
                  </TableCell>
                  <TableCell colSpan={4} />
                </TableRow>

              </TableBody>
            </Table>
          </Box>

          {
            this.assignees().length >= 1 &&
              <ApplyDefaultSchedule
                assignees={this.assignees()}
                calendarId={calendar._id}
              />
          }
        </div>
      </div>
    )
  }
}

export const SchedulesDefaultScreen = withTracker(composer)(SchedulesDefaultScreenComponent)

class EditSchedule extends React.Component {
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
    const { onCancel, schedule, title } = this.props
    const { from, to, note, bookable, pause } = this.state

    return (
      <Modal show enforceFocus={false} onHide={onCancel} bsSize='small'>
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
          <Button size='small' variant='contained' color='primary' onClick={this.handleSave}>
            <Icon name='check' />&nbsp;Speichern
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
