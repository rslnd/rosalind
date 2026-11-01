import React from 'react'
import sortBy from 'lodash/sortBy'
import Button from '@material-ui/core/Button'
import { Icon } from '../../components/Icon'
import { __ } from '../../../i18n'
import { HMtoString } from '../../../util/time/hm'
import { weekdays as allWeekdays } from '../../../util/time/weekdays'
import { defaultScheduleProblems } from '../../../api/schedules/methods/validateDefaultSchedule'
import { EditSchedule, HMRangeToStringWithRoles, saveDefaultSchedule } from '../default/EditSchedule'

// Compact, editable view of the default schedule ("Wochenplan") of some
// persons on some weekdays. Changes are saved to the Wochenplan right away.
export class WeekPlanPreview extends React.Component {
  constructor (props) {
    super(props)
    this.state = { edit: null } // { schedule } or { assigneeId, weekday }
  }

  render () {
    const { calendar, defaultSchedules, userIds, weekdays, name, zIndex } = this.props
    const { edit } = this.state
    const days = allWeekdays.filter(w => weekdays.includes(w))

    if (userIds.length === 0 || days.length === 0) { return null }

    const close = () => this.setState({ edit: null })
    const editTitle = (assigneeId, weekday) => `${name(assigneeId)} · ${__(`time.${weekday}`)}`

    return (
      <div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle} />
              {days.map(w => <th key={w} style={{ ...thStyle, textAlign: 'center' }}>{__(`time.${w}`)}</th>)}
            </tr>
          </thead>
          <tbody>
            {userIds.map(userId =>
              <tr key={userId}>
                <td style={{ ...tdStyle, fontWeight: 'bold', whiteSpace: 'nowrap', width: '1%' }}>{name(userId)}</td>
                {days.map(weekday => {
                  const blocks = sortBy(defaultSchedules.filter(d =>
                    d.userId === userId && d.weekday === weekday), d => HMtoString(d.from))
                  return (
                    <td key={weekday} style={tdStyle}>
                      {blocks.map(b => {
                        const problems = defaultScheduleProblems({ calendar, schedule: b })
                        return (
                          <div
                            key={b._id}
                            title={problems.length >= 1 ? problems.join('\n') : 'Bearbeiten'}
                            onClick={() => this.setState({ edit: { schedule: b } })}
                            style={{
                              ...blockStyle,
                              opacity: b.available === false ? 0.6 : 1,
                              color: problems.length >= 1 ? '#c0392b' : (b.note && b.note.includes('!') ? 'red' : 'inherit'),
                              borderColor: problems.length >= 1 ? '#c0392b' : '#e1e4e8'
                            }}>
                            {problems.length >= 1 && <><Icon name='exclamation-triangle' />&nbsp;</>}
                            {HMRangeToStringWithRoles(b)}
                            {b.bookable && <>&nbsp;<Icon name='share-square-o' title='Online buchbar' /></>}
                          </div>
                        )
                      })}
                      <Button
                        size='small'
                        style={addButtonStyle}
                        title='Zeit hinzufügen'
                        onClick={() => this.setState({ edit: { assigneeId: userId, weekday } })}>
                        <Icon name='plus' />
                      </Button>
                    </td>
                  )
                })}
              </tr>
            )}
          </tbody>
        </table>

        {edit && edit.schedule &&
          <EditSchedule
            schedule={edit.schedule}
            calendar={calendar}
            zIndex={zIndex}
            title={editTitle(edit.schedule.userId, edit.schedule.weekday)}
            onChange={s => { saveDefaultSchedule(edit.schedule)(s); close() }}
            onCancel={close} />
        }
        {edit && !edit.schedule &&
          <EditSchedule
            calendar={calendar}
            zIndex={zIndex}
            title={editTitle(edit.assigneeId, edit.weekday)}
            onChange={s => {
              saveDefaultSchedule({ assigneeId: edit.assigneeId, weekday: edit.weekday, calendarId: calendar._id })(s)
              close()
            }}
            onCancel={close} />
        }
      </div>
    )
  }
}

const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'auto' }
const thStyle = { borderBottom: '1px solid #e1e4e8', padding: '4px 6px', fontWeight: 'bold' }
const tdStyle = { borderBottom: '1px solid #f0f0f0', padding: '4px 6px', verticalAlign: 'top' }
const blockStyle = {
  border: '1px solid #e1e4e8',
  borderRadius: 3,
  padding: '1px 4px',
  marginBottom: 2,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  background: '#fff'
}
const addButtonStyle = { minWidth: 0, width: '100%', padding: 0, opacity: 0.35 }
