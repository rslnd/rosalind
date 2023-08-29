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
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { ApplyDefaultSchedule } from './ApplyDefaultSchedule'
import { subscribe } from '../../../util/meteor/subscribe'
import { HMtoString, HMRangeToString, stringToHMRange } from '../../../util/time/hm'

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
                    onChange={this.handleSaveEdit(s)}
                    onCancel={this.handleEndEdit}
                  />
                ) : (
                  <Button
                    size='medium'
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      color: s.note && s.note.includes("!") ? "red" : "inherit",
                      opacity: s.note && s.note.toUpperCase() === 'PAUSE' ? 0.7 : 1
                    }}
                    onClick={this.handleStartEdit(s._id)}>
                      {HMRangeToStringWithRoles(s)}
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
                      <TableCell key={weekday}>
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

    this.state = {
      value: HMRangeToStringWithRoles(this.props.schedule)
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSave = this.handleSave.bind(this)
  }

  handleChange (e) {
    this.setState({
      value: e.target.value
    })
  }

  handleSave () {
    if (!this.state.value) {
      this.props.onChange(null)
      return
    }

    const { note, from, to } = stringToHMRange(this.state.value)

    const regex = /role-[a-zA-Z0-9-]+/g
    const roles = (note && note.match(regex))
      ? note.match(regex).map(r => r.replace(/^role-/, ''))
      : undefined
    const remainingNote = note ? note.replace(regex, '') : undefined

    const schedule = {
      from,
      to,
      note: remainingNote,
      roles
    }

    this.props.onChange(schedule)
  }

  render () {
    const { onCancel } = this.props

    return (
      <form onSubmit={this.handleSave}>
        <TextField
          autoFocus
          onChange={this.handleChange}
          value={this.state.value}
        />
        <br />
        <Button style={{ minWidth: 25, opacity: 0.2 }} onClick={onCancel}>
          <Icon name='times' />
        </Button>
        <Button style={{ minWidth: 25 }} onClick={this.handleSave}>
          <Icon name='check' />
        </Button>
      </form>
    )
  }
}
