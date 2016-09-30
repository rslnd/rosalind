import map from 'lodash/fp/map'
import identity from 'lodash/identity'
import React from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import { Patients } from 'api/patients'
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
      return { options }
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

        <span className={style.name}>{patient && <PatientName patient={patient} />}&emsp;</span>
        <span className={style.birthday}>{patient && <Birthday day={patient.profile.birthday} />}</span>
      </div>
    )
  }
}

const PatientNameSelected = ({ value }) => (
  <div className="Select-value">
    <span className="Select-value-label">
      <PatientName patient={value.patient} />
    </span>
  </div>
)

export class PatientPicker extends React.Component {
  handleQueryChange (query) {
    if (this.props.input.onChange && query && query.value) {
      this.props.input.onChange(query.value)
    }
  }

  render () {
    return (
      <Select.Async
        value={this.props.input.value || ''}
        loadOptions={findPatients}
        onChange={(q) => this.handleQueryChange(q)}
        onBlur={() => this.props.input.onBlur(this.props.input.value)}
        cache={false}
        autofocus={this.props.autofocus}
        filterOptions={identity}
        optionComponent={PatientSearchResult}
        valueComponent={PatientNameSelected} />
    )
  }
}
