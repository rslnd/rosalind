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
import Button from '@material-ui/core/Button'
import { ApplyDefaultSchedule } from './ApplyDefaultSchedule'
import { EditSchedule, HMRangeToStringWithRoles } from './EditSchedule'
import { subscribe } from '../../../util/meteor/subscribe'
import { HMtoString, HMRangeToString } from '../../../util/time/hm'
import Alert from 'react-s-alert'
import { defaultScheduleProblems } from '../../../api/schedules/methods/validateDefaultSchedule'


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
        }).catch(err => { Alert.error(err.reason || __('ui.error')); console.error(err) })
      } else if (!newSchedule && _id) {
        console.log('deleting schedule', _id)
        Schedules.actions.upsertDefaultSchedule.callPromise({
          newSchedule,
          scheduleId: _id
        }).catch(err => { Alert.error(err.reason || __('ui.error')); console.error(err) })
      } else if (newSchedule && !_id) {
        console.log('inserting new schedule', { newSchedule, assigneeId, weekday })
        Schedules.actions.upsertDefaultSchedule.callPromise({
          newSchedule,
          weekday,
          userId: assigneeId,
          calendarId: this.props.calendar._id
        }).catch(err => { Alert.error(err.reason || __('ui.error')); console.error(err) })
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
        schedules.map(s => {
          const problems = defaultScheduleProblems({ calendar: this.props.calendar, schedule: s })
          return <div key={s._id}>
            {
              isEditingSchedule(s._id)
                ? (
                  <EditSchedule
                    schedule={s}
                    calendar={this.props.calendar}
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
                    title={problems.length >= 1 ? problems.join('\n') : undefined}
                    onClick={this.handleStartEdit(s._id)}>
                      {problems.length >= 1 && <><span style={{ color: '#c0392b' }}><Icon name='exclamation-triangle' /></span>&nbsp;</>}
                      {HMRangeToStringWithRoles(s)}
                      {s.bookable && <>&nbsp;<Icon name='globe' title='Online buchbar' /></>}
                  </Button>
                )
            }
          </div>
        })
      }

      {
        isAddingSchedule
          ? (
            <EditSchedule
              calendar={this.props.calendar}
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
                defaultSchedules={this.props.defaultSchedules}
                calendarId={calendar._id}
              />
          }
        </div>
      </div>
    )
  }
}

export const SchedulesDefaultScreen = withTracker(composer)(SchedulesDefaultScreenComponent)
