import moment from 'moment-timezone'
import { monkey } from 'spotoninc-moment-round'
import schedulesStyle from './schedulesStyle'

monkey(moment)

export const schedules = ({ assignees, onDoubleClick }) => (
  assignees.map((assignee) => (
    assignee.schedules && assignee.schedules.map((schedule) => {
      if (!schedule.start && !schedule.end) {
        return null
      }
      const timeStart = moment(schedule.start).floor(5, 'minutes')
      const timeEnd = moment(schedule.end).ceil(5, 'minutes')

      return (
        <div
          key={`schedule-${schedule._id}`}
          data-scheduleId={schedule._id}
          className={schedulesStyle.scheduledUnavailable}
          onDoubleClick={(event) => onDoubleClick({ event, scheduleId: schedule._id })}
          style={{
            gridRowStart: timeStart.format('[T]HHmm'),
            gridRowEnd: timeEnd.format('[T]HHmm'),
            gridColumn: `assignee-${schedule.userId}`
          }}>

          {/* <div className={style.schedulesText}>
            {!timeStart.isSame(moment(viewRange(timeStart).start).floor(5, 'minutes'), 'minute') && timeStart.format('H:mm')}
          </div>
          <div className={style.schedulesText}>
            {!timeEnd.isSame(moment(viewRange(timeEnd).end).ceil(5, 'minutes'), 'minute') && timeEnd.format('H:mm')}
          </div> */}
        </div>
      )
    })
  ))
)
