import React from 'react'
import moment from 'moment-timezone'
import { TAPi18n } from 'meteor/tap:i18n'
import { Indicator } from '../appointments/appointment/Indicator'
import { Birthday } from './Birthday'
import { UserHelper } from '../users/UserHelper'
import { Icon } from '../components/Icon'
import { PatientName } from './PatientName'
import { darkGray, darkGrayDisabled } from '../css/global'
import { TagsList } from '../tags/TagsList'

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
            <span style={nameStyle}>{patient && <PatientName patient={patient} />}&emsp;</span>
            <span style={birthdayStyle}>{patient && <Birthday day={patient.birthday} veryShort />}</span>
            {
              patient.appointments &&
                <span>
                  {patient.appointments.map((appointment) => {
                    const start = moment(appointment.start)

                    return (
                      <span
                        key={appointment._id}
                        style={appointmentStyle}>
                        <TagsList tiny tags={appointment.tags} />
                        &ensp;
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
                            <span style={assigneeNameStyle}>
                              <UserHelper userId={appointment.assigneeId} helper='lastNameWithTitle' />
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
            <Icon name='user-plus' />&nbsp;{TAPi18n.__('patients.thisInsert')}
            {
              query && <span>:&nbsp;{query}</span>
            }
          </span>
        }
      </div>
    )
  }
}

const nameStyle = {
  display: 'inline-block',
  width: '50%'
}

const birthdayStyle = {
  color: darkGray,
  display: 'inline-block',
  textAlign: 'right',
  width: '50%'
}

const appointmentStyle = {
  display: 'flex',
  marginBottom: 4,
  marginLeft: 4
}

const assigneeNameStyle = {
  alignSelf: 'flex-end',
  color: darkGrayDisabled,
  flexGrow: 1,
  textAlign: 'right'
}
