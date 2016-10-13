import map from 'lodash/fp/map'
import identity from 'lodash/identity'
import React from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import { TAPi18n } from 'meteor/tap:i18n'
import { Patients } from 'api/patients'
import { Icon } from 'client/ui/components/Icon'
import { PatientName } from './PatientName'
import { Birthday } from './Birthday'
import style from './patientPickerStyle'

const findPatients = (query) => {
  return Patients.methods.search.callPromise({ query })
    .then(map((patient) => {
      return {
        label: `${patient.profile.lastName} ${patient.profile.firstName}`,
        value: patient._id,
        patient
      }
    })).then((options) => {
      return {
        options: [ ...options, {
          value: 'newPatient'
        } ]
      }
    })
}

class PatientSearchResult extends React.Component {
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
    const patient = this.props.option.patient

    return (
      <div className={this.props.className}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        title={this.props.option.title}>

        {
          patient
          ? (
            <span>
              <span className={style.name}>{patient && <PatientName patient={patient} />}&emsp;</span>
              <span className={style.birthday}>{patient && <Birthday day={patient.profile.birthday} />}</span>
            </span>
          ) : (
            <span><Icon name="user-plus" />&nbsp;{TAPi18n.__('patients.thisInsert')}</span>
          )
        }
      </div>
    )
  }
}

const PatientNameSelected = ({ value }) => (
  <div className="Select-value">
    <span className="Select-value-label">
      {
        value.patient
        ? <PatientName patient={value.patient} />
        : <span>Creating new patient</span>
      }
    </span>
  </div>
)

export class PatientPicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newPatient: false
    }
    this.handleQueryChange = this.handleQueryChange.bind(this)

    this.handleCloseNewPatient = this.handleCloseNewPatient.bind(this)
    this.handleOpenNewPatient = this.handleOpenNewPatient.bind(this)
  }

  handleQueryChange (query) {
    if (query && query.value) {
      if (query.value === 'newPatient') {
        this.handleOpenNewPatient()
      }

      if (this.props.input.onChange) {
        this.props.input.onChange(query.value)
      }
    }
  }

  handleOpenNewPatient () {
    this.setState({
      ...this.state,
      newPatient: true
    })
  }

  handleCloseNewPatient () {
    this.setState({
      ...this.state,
      newPatient: false
    })
  }

  render () {
    return (
      <div>
        <Select.Async
          value={this.props.input.value || ''}
          ref={(c) => { this._select = c }}
          loadOptions={findPatients}
          onChange={this.handleQueryChange}
          onBlur={() => this.props.input.onBlur(this.props.input.value)}
          cache={false}
          autofocus={this.props.autofocus}
          placeholder={TAPi18n.__('patients.search')}
          filterOptions={identity}
          optionComponent={PatientSearchResult}
          valueComponent={PatientNameSelected} />
        {/* <Popover
          open={this.state.newPatient}
          onRequestClose={this.handleCloseNewPatient}
          anchorEl={this._select}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}>
          Create new patient
        </Popover> */}
      </div>
    )
  }
}
