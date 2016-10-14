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
import { NewPatientFormFields } from './NewPatientFormFields'

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
        : <span><Icon name="user-plus" />&nbsp;{TAPi18n.__('patients.thisNew')}</span>
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
        this.props.dispatch({ type: 'OPEN_NEW_PATIENT' })
      } else {
        this.handleCloseNewPatient()
        this.props.dispatch({ type: 'CLOSE_NEW_PATIENT' })
      }

      if (this.props.input.onChange) {
        this.props.input.onChange(query.value)
      }
    } else {
      if (this.props.input.onChange) {
        this.props.input.onChange('')
      }
      this.handleCloseNewPatient()
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
    // Fuzzy-parse query for pre-filling new patient form
    let lastName, firstName
    if (this.state.newPatient) {
      const splitQuery = this.props.input.value && this.props.input.value.split(' ')
      if (splitQuery) {
        const possibleLastName = splitQuery[0]
        if (possibleLastName && possibleLastName.match(/[a-zA-Z]/)) {
          lastName = possibleLastName
        }

        const possibleFirstName = splitQuery[1]
        if (possibleFirstName && possibleFirstName.match(/[a-zA-Z]/)) {
          firstName = possibleFirstName
        }
      }
    }

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
        {
          this.state.newPatient && <div>
            <NewPatientFormFields
              lastName={lastName}
              firstName={firstName} />
          </div>
        }
      </div>
    )
  }
}
