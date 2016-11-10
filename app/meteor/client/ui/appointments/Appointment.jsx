import React from 'react'
import moment from 'moment'
import classnames from 'classnames'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'
import { getColor } from 'client/ui/tags/getColor'
import style from './appointmentStyle'

const Indicator = ({ appointment }) => (
  <span className="pull-right">
    {
      (appointment.treated || appointment.admitted)
        ? <span key="show" style={{ display: 'inline-block', color: '#8fc6ae' }}>
          <Icon name="check" />&nbsp;
        </span>
        : ((moment().diff(appointment.end, 'hours') >= 4) &&
          <span key="noShow" style={{ display: 'inline-block', color: '#e37067' }}>
            <Icon name="times" />&nbsp;
          </span>
        )
    }
  </span>
)

export class Appointment extends React.Component {
  stripNumbers (text) {
    if (typeof text === 'string') {
      return text.replace(/\d{3,}/g, '')
    }
  }

  render () {
    const appointment = this.props.appointment
    const start = moment(appointment.start)
    const classes = classnames({
      [ style.appointment ]: true,
      [ style.canceled ]: appointment.canceled,
      [ style.admitted ]: appointment.admitted,
      [ style.treated ]: appointment.treated,
      [ style.locked ]: appointment.lockedAt
    })

    const tagColor = getColor(appointment.tags)

    return (
      <div
        id={appointment._id}
        data-appointmentId={appointment._id}
        className={classes}
        onClick={(e) => this.props.onClick(e, appointment)}
        onContextMenu={(e) => this.props.onClick(e, appointment)}
        title={start.format('H:mm')}
        style={{
          gridRowStart: start.format('[time-]HHmm'),
          gridRowEnd: moment(appointment.end).format('[time-]HHmm'),
          gridColumn: `assignee-${appointment.assigneeId}`,
          borderLeftColor: tagColor,
          zIndex: appointment.lockedAt ? 29 : 30
        }}>

        {
          appointment.lockedAt &&
            <span className="text-muted">
              <i className="fa fa-clock-o fa-fw"></i>&nbsp;
              {TAPi18n.__('appointments.lockedBy', { name: appointment.lockedByFirstName })}
            </span>
        }

        <Indicator appointment={appointment} />

        {
          appointment.patient
          ? (
            <span style={{ hyphens: 'auto' }}>
              <span className={style.prefix}>{appointment.patient.prefix}&#8202;</span>
              <b>{appointment.patient.profile.lastName} &thinsp;</b>
              <span>{appointment.patient.profile.firstName}</span>
            </span>
          ) : !appointment.lockedAt && (
            <span>
              {this.stripNumbers(appointment.notes) || <Icon name="question-circle" />}
            </span>
          )
        }
      </div>
    )
  }
}
