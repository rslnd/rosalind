import React from 'react'
import moment from 'moment-timezone'
import { TAPi18n } from 'meteor/tap:i18n'
import { Indicator } from 'client/ui/appointments/appointment/Indicator'
import { Birthday } from '../Birthday'
import { getColor } from 'client/ui/tags/getColor'
import { UserHelper } from 'client/ui/users/UserHelper'
import { Icon } from 'client/ui/components/Icon'
import { PatientName } from '../PatientName'
import style from './patientPickerStyle'

export class PatientSearchResult extends React.Component {
  constructor (props) {
    super(props)

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
  }

  handleMouseDown (event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.onSelect(this.props.option, event)
  }

  handleMouseEnter (event) {
    this.props.onFocus(this.props.option, event)
  }

  handleMouseMove (event) {
    if (this.props.isFocused) { return }
    this.props.onFocus(this.props.option, event)
  }

  render () {
    const { patient, newPatient, query } = this.props.option

    return (
      <div className={this.props.className}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        title={this.props.option.title}>

        {
          patient && <span>
            <span className={style.name}>{patient && <PatientName patient={patient} />}&emsp;</span>
            <span className={style.birthday}>{patient && <Birthday day={patient.profile.birthday} veryShort />}</span>
            {
              patient.appointments &&
                <span className={style.appointments}>
                  {patient.appointments.map((appointment) => {
                    const start = moment(appointment.start)

                    return (
                      <span
                        key={appointment._id}
                        className={style.appointment}
                        style={{
                          borderColor: getColor(appointment.tags)
                        }}>
                        <span style={{
                          textDecoration: appointment.canceled && 'line-through'
                        }}>
                          {start.format(TAPi18n.__('time.dateFormatShort'))}
                          &nbsp;
                          {start.format(TAPi18n.__('time.timeFormat'))}
                        </span>
                        &emsp;
                        {
                          appointment.assigneeId &&
                            <span className={style.assigneeName}>
                              <UserHelper userId={appointment.assigneeId} helper="lastNameWithTitle" />
                              &emsp;
                              <Indicator appointment={appointment} />
                            </span>
                        }
                      </span>
                    )
                  })}
                </span>
            }
          </span>
        }
        {
          newPatient && <span>
            <Icon name="user-plus" />&nbsp;{TAPi18n.__('patients.thisInsert')}
            {
              query && <span>:&nbsp;{query}</span>
            }
          </span>
        }
      </div>
    )
  }
}
