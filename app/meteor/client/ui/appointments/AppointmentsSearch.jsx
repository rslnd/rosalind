import moment from 'moment'
import identity from 'lodash/identity'
import React from 'react'
import Select from 'react-select'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from 'api/users'
import { Search } from 'api/search'
import { Indicator } from 'client/ui/appointments/Appointment'
import { UserHelper } from 'client/ui/users/UserHelper'
import { PatientName } from 'client/ui/patients/PatientName'
import { Birthday } from 'client/ui/patients/Birthday'
import { getColor } from 'client/ui/tags/getColor'
import style from './appointmentsSearchStyle'

class AppointmentSearchResult extends React.Component {
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
    const { patient, appointment } = this.props.option
    let tagColor, start
    if (appointment) {
      tagColor = getColor(appointment.tags)
      start = moment(appointment.start)
    }

    return (
      <div className={this.props.className}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}>

        {
          patient && <span>
            <span className={style.name}>{patient && <PatientName patient={patient} />}&emsp;</span>
            {
              patient.profile && patient.profile.birthday &&
                <span className={style.birthday}>{patient && <Birthday day={patient.profile.birthday} veryShort />}</span>
            }
          </span>
        }
        {
          appointment && <span
            className={style.appointment}
            style={{
              borderColor: tagColor,
              textDecoration: appointment.canceled && 'line-through'
            }}>
            <span>
              {start.format(TAPi18n.__('time.dateFormat'))}
              &nbsp;
              {TAPi18n.__('time.at')}
              &nbsp;
              {start.format(TAPi18n.__('time.timeFormat'))}
            </span>
            &emsp;
            {
              appointment.assigneeId &&
                <span className={style.assigneeName}>
                  <UserHelper userId={appointment.assigneeId} helper="fullNameWithTitle" />
                </span>
            }
            <Indicator appointment={appointment} />
          </span>
        }
      </div>
    )
  }
}

const SelectedResult = ({ value }) => (
  <div className="Select-value">
    <span className="Select-value-label">
      {value.patient && <PatientName patient={value.patient} />}
    </span>
  </div>
)

export class AppointmentsSearch extends React.Component {
  constructor (props) {
    super(props)
    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.loadOptions = this.loadOptions.bind(this)
  }

  handleQueryChange (query) {
    this.props.dispatch({
      type: 'APPOINTMENTS_SEARCH_QUERY_CHANGE',
      query: query
    })
  }

  loadOptions () {
    return new Promise((resolve) => {
      resolve(this.props.options)
    })
  }

  render () {
    return (
      <Select.Async
        name="appointmentsSearch"
        value={this.props.query}
        options={this.props.options}
        loadOptions={!this.props.options ? this.props.findAppointments : this.loadOptions}
        onChange={this.handleQueryChange}
        cache={false}
        ignoreCase={false}
        ignoreAccents={false}
        autofocus={false}
        onCloseResetsInput={false}
        placeholder={TAPi18n.__('appointments.search')}
        loadingPlaceholder={TAPi18n.__('appointments.searching')}
        searchPromptText={'Suche nach PatientInnen, Geburtsdatum'}
        clearValueText={TAPi18n.__('ui.clear')}
        filterOptions={identity}
        optionComponent={AppointmentSearchResult}
        valueComponent={SelectedResult} />
    )
  }
}
