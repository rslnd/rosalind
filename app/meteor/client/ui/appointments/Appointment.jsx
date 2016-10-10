import React from 'react'
import moment from 'moment'
import classnames from 'classnames'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import sortBy from 'lodash/fp/sortBy'
import { TAPi18n } from 'meteor/tap:i18n'
import { Tags } from 'api/tags'
import { Icon } from 'client/ui/components/Icon'
import style from './style'

export class Appointment extends React.Component {
  stripNumbers (text) {
    if (typeof text === 'string') {
      return text.replace(/\d{3,}/g, '')
    }
  }

  getColor (tags = []) {
    if (tags.length === 0) {
      return '#ccc'
    } else {
      return flow(
        map((tag) => {
          return Tags.findOne({ tag: tag })
        }),
        sortBy('order'),
        map((tag) => {
          return tag.color || '#ccc'
        })
      )(tags)[0]
    }
  }

  render () {
    const appointment = this.props.appointment

    const classes = classnames({
      [ style.appointment ]: true,
      [ style.canceled ]: appointment.canceled,
      [ style.admitted ]: appointment.admitted,
      [ style.treated ]: appointment.treated,
      [ style.locked ]: appointment.lockedAt
    })

    const tagColor = this.getColor(appointment.tags)

    return (
      <div
        data-appointmentId={appointment._id}
        className={classes}
        onClick={() => this.props.handleAppointmentModalOpen(appointment)}
        style={{
          gridRowStart: moment(appointment.start).format('[time-]HHmm'),
          gridRowEnd: moment(appointment.end).format('[time-]HHmm'),
          gridColumn: `assignee-${appointment.assigneeId}`,
          borderColor: tagColor,
          zIndex: 30
        }}>

        {
          appointment.treated
          ? (
            <span
              style={{ color: tagColor }}>
              <Icon name="check" />&nbsp;
            </span>
          ) : (
            appointment.admitted &&
              <span
                style={{ color: tagColor }}>
                <Icon name="refresh" />&nbsp;
              </span>
          )
        }

        {
          appointment.lockedAt &&
            <span className="text-muted">
              <i className="fa fa-clock-o fa-fw"></i>
              {TAPi18n.__('appointments.lockedBy', { name: appointment.lockedByFirstName })}
            </span>
        }

        {
          appointment.patient
          ? (
            <span>
              <span className={style.prefix}>{appointment.patient.prefix}&#8202;</span>
              <b>{appointment.patient.profile.lastName}</b>&thinsp;
              {appointment.patient.profile.firstName}
            </span>
          ) : (
            <span>
              {this.stripNumbers(appointment.notes) || <Icon name="question-circle" />}
            </span>
          )
        }
      </div>
    )
  }
}
