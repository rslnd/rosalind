import moment from 'moment-timezone'
import overrideOverlayStyle from './overrideOverlayStyle'

export const overrideOverlay = ({ overrideStart, overrideEnd }) => {
  if (overrideStart) {
    const start = moment(this.state.overrideStart)
    const end = moment(this.state.overrideEnd).add(1, 'second')

    return (
      <div
        key="override-start"
        className={overrideOverlayStyle.overrideOverlay}
        style={{
          gridRowStart: start.format('H:mm'),
          gridRowEnd: end.format('H:mm'),
          gridColumn: `assignee-${this.state.overrideAssigneeId}`
        }}>
        <div>{start.format('H:mm')}</div>
        <div>{end.format('H:mm')}</div>
      </div>
    )
  } else {
    return null
  }
}
