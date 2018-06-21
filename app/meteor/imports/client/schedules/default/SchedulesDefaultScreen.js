import React from 'react'
import uniq from 'lodash/uniq'
import identity from 'lodash/identity'
import { Calendars } from '../../../api/calendars'
import { Schedules } from '../../../api/schedules'
import { weekdays } from '../../../api/schedules/schema'
import { Users } from '../../../api/users'
import { Box } from '../../components/Box'
import { UserPickerContainer } from '../../users/UserPickerContainer'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { withTracker } from 'meteor/react-meteor-data'
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from '../../components/Table'
import { Icon } from '../../components/Icon'
import { Button, TextField } from 'material-ui'

const leftPad = n => ('00' + n).slice(-2)

const renderTime = hm => {
  if (!hm) return null
  return [
    leftPad(hm.h),
    leftPad(hm.m)
  ].join(':')
}

const parseTime = s => {
  const [h, m] = s.split(':')
  return {
    h: h ? parseInt(h, 10) : 0,
    m: m ? parseInt(m, 10) : 0
  }
}

const scheduleToString = ({ to, from }) =>
  [
    renderTime(from),
    renderTime(to)
  ].filter(identity).join('-')

const stringToSchedule = s => {
  if (!s) { return null }
  const [from, to] = s.split('-')
  return {
    from: parseTime(from),
    to: parseTime(to)
  }
}

const composer = props => {
  const { slug } = props.match.params
  const calendar = Calendars.findOne({ slug })
  const users = Users.find({}).fetch()

  Meteor.subscribe('schedules-default', {})

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
    )
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
        console.log('inserting new schedule', { newSchedule, assigneeId, weekday})
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
    const schedules = this.props.defaultSchedules.filter(s =>
      s.userId === assigneeId &&
      s.weekday === weekday
    )

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
                    from={s.from}
                    to={s.to}
                    onChange={this.handleSaveEdit(s)}
                    onCancel={this.handleEndEdit}
                  />
                ) : (
                  <div onClick={this.handleStartEdit(s._id)}>
                    {scheduleToString(s)}
                  </div>
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
          canAddSchedule && <Button onClick={this.handleAddScheduleWeekday({ weekday, assigneeId })}>
            <Icon style={{ opacity: 0.1 }} name='plus' />
          </Button>
        )

      }

    </div>
  }

  render () {
    const {
      calendar,
      defaultSchedules
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
                        {TAPi18n.__(`time.${weekday}`)}
                      </TableCell>
                    )
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  this.assignees().map(assignee =>
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
                  <TableCell>
                    <UserPickerContainer
                      onChange={this.handleAddAssignee}
                    />
                  </TableCell>
                </TableRow>

              </TableBody>
            </Table>
          </Box>

          <Box title='Wochenplan anwenden' icon='magic'>
            Do the Magic
          </Box>

        </div>
      </div>
    )
  }
}

export const SchedulesDefaultScreen = withTracker(composer)(SchedulesDefaultScreenComponent)


class EditSchedule extends React.Component {
  constructor (props) {
    super(props)

    const { from, to } = this.props

    this.state = {
      value: scheduleToString({ from, to })
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
    this.props.onChange(stringToSchedule(this.state.value))
  }

  render () {
    const { from, to, onCancel } = this.props

    return (
      <div>
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
      </div>
    )
  }
}
