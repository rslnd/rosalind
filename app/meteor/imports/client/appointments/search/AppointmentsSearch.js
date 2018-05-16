import moment from 'moment-timezone'
import identity from 'lodash/identity'
import React from 'react'
import Select from 'react-select'
import { __ } from '../../../i18n'
import { Indicator } from '../appointment/Indicator'
import { UserHelper } from '../../users/UserHelper'
import { PatientName } from '../../patients/PatientName'
import { Birthday } from '../../patients/Birthday'
import { getColor } from '../../tags/getColor'
import './appointmentsSearchStyle'
import { darkGray, darkGrayDisabled, primaryActive } from '../../css/global'
import { TagsList } from '../../tags/TagsList'
import { subscribe } from '../../../util/meteor/subscribe'

const style = {
  name: {
    display: 'inline-block',
    width: '50%'
  },
  birthday: {
    color: darkGray,
    display: 'inline-block',
    textAlign: 'right',
    width: '50%'
  },
  appointment: {
    marginLeft: 12,
    marginTop: -4
  },
  assigneeName: {
    alignSelf: 'flex-end',
    color: darkGrayDisabled,
    flexGrow: 1,
    textAlign: 'right'
  }
}

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
            <span style={style.name}>{patient && <PatientName patient={patient} />}&emsp;</span>
            {
              patient.birthday &&
                <span style={style.birthday}>{patient && <Birthday day={patient.birthday} veryShort />}</span>
            }
          </span>
        }
        {
          appointment && <span
            style={style.appointment}>
            <TagsList tiny tags={appointment.tags} />
            &ensp;
            <span style={{
              textDecoration: appointment.canceled && 'line-through',
              verticalAlign: '-2px'
            }}>
              {start.format(__('time.dateFormatShort'))}
              &nbsp;
              {__('time.at')}
              &nbsp;
              {start.format(__('time.timeFormat'))}
            </span>
            &emsp;
            {
              appointment.assigneeId &&
                <span style={style.assigneeName}>
                  <UserHelper userId={appointment.assigneeId} helper='lastNameWithTitle' />
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
  <div className='Select-value'>
    <span className='Select-value-label'>
      {value.patient && <PatientName patient={value.patient} />}
    </span>
  </div>
)

export class AppointmentsSearch extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      subscription: null
    }

    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.loadOptions = this.loadOptions.bind(this)
  }

  loadOptions () {
    return new Promise((resolve) => {
      resolve(this.props.options)
    })
  }

  handleQueryChange (query) {
    if (this.state.subscription) {
      this.state.subscription.stop()
    }

    if (query && query.patient) {
      const patientId = query.patient._id

      this.setState({
        subscription: subscribe('patients', { patientIds: [patientId] })
      })
    }

    this.props.handleQueryChange(query)
  }

  render () {
    return (
      <Select.Async
        name='appointmentsSearch'
        value={this.props.query}
        options={this.props.options}
        loadOptions={!this.props.options ? this.props.findAppointments : this.loadOptions}
        onChange={this.handleQueryChange}
        cache={false}
        ignoreCase={false}
        ignoreAccents={false}
        autoFocus={false}
        onSelectResetsInput={false}
        onCloseResetsInput={false}
        onBlurResetsInput={false}
        placeholder={__('appointments.search')}
        loadingPlaceholder={__('appointments.searching')}
        searchPromptText={'Suche nach PatientInnen, Geburtsdatum'}
        clearValueText={__('ui.clear')}
        filterOptions={identity}
        optionComponent={AppointmentSearchResult}
        valueComponent={SelectedResult} />
    )
  }
}
