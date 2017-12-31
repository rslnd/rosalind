import identity from 'lodash/identity'
import React from 'react'
import Select from 'react-select'
import { TAPi18n } from 'meteor/tap:i18n'
import { startCase } from '../../../util/fuzzy/startCase'
import { findPatients } from './findPatients'
import { NewPatientFormFieldsContainer } from './NewPatientFormFieldsContainer'
import { PatientSearchResult } from './PatientSearchResult'
import { PatientNameSelected } from './PatientNameSelected'
import { isValid, missingPatientInfo } from './missingPatientInfo'

export class PatientPicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newPatient: false,
      searchValue: ''
    }
    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.handleCloseNewPatient = this.handleCloseNewPatient.bind(this)
    this.handleOpenNewPatient = this.handleOpenNewPatient.bind(this)
    this.handleSearchValueChange = this.handleSearchValueChange.bind(this)
  }

  // Fuzzy-parse query for pre-filling new patient form
  // TODO: Extract to method on Patients, merge with fuzzy birthday parsing
  parseQueryForAutofill (query = '') {
    const regexFemale = /^(fr\b|frau\b)/i
    const regexMale = /^(hr\b|herr\b)/i
    let autofill = {}
    let restQuery = ''

    if (query.match(regexFemale)) {
      autofill.gender = 'Female'
      restQuery = query.replace(regexFemale, '').trim()
    } else if (query.match(regexMale)) {
      autofill.gender = 'Male'
      restQuery = query.replace(regexMale, '').trim()
    } else {
      restQuery = query
    }

    const splitQuery = restQuery.split(' ')

    const possibleLastName = splitQuery[0]
    if (possibleLastName && possibleLastName.match(/[a-zA-Z]/)) {
      autofill.lastName = startCase(possibleLastName)
    }

    const possibleFirstName = splitQuery[1]
    if (possibleFirstName && possibleFirstName.match(/[a-zA-Z]/)) {
      autofill.firstName = startCase(possibleFirstName)
    }

    console.log('[PatientPicker] Autofill', { query, autofill })
    return autofill
  }

  handleQueryChange (query) {
    if (query) {
      if (query.newPatient) {
        const autofill = this.parseQueryForAutofill(query.query)
        this.handleOpenNewPatient()
        this.props.dispatch({ type: 'OPEN_NEW_PATIENT', autofill })
      } else {
        this.handleCloseNewPatient()
        this.props.dispatch({ type: 'CLOSE_NEW_PATIENT' })
      }

      if (this.props.input.onChange) {
        console.log('[PatientPicker] onChange', query.value ? query.value : '')
        this.props.input.onChange(query.value ? query.value : '')
      }
    } else {
      console.log('[PatientPicker] no query, closing new patient form')
      if (this.props.input.onChange) {
        this.props.input.onChange('')
      }
      this.setState({
        searchValue: ''
      })
      this.handleCloseNewPatient()
    }
  }

  handleOpenNewPatient () {
    this.setState({
      newPatient: true
    })
  }

  handleCloseNewPatient () {
    this.setState({
      newPatient: false
    })
  }

  handleSearchValueChange (val) {
    this.setState({
      searchValue: val
    })
  }

  render () {
    return (
      <div>
        <Select.Async
          name='patientPicker'
          value={this.props.value || this.props.input.value || ''}
          loadOptions={findPatients}
          onChange={this.handleQueryChange}
          onInputChange={this.handleSearchValueChange}
          inputValue={this.state.searchValue}
          onBlur={() => this.props.input.onBlur(this.props.input.value)}
          autoBlur
          cache={false}
          ignoreCase={false}
          ignoreAccents={false}
          autofocus={this.props.autofocus && !this.props.value}
          placeholder={TAPi18n.__('patients.search')}
          loadingPlaceholder={TAPi18n.__('patients.searching')}
          clearValueText={TAPi18n.__('ui.clear')}
          filterOptions={identity}
          optionComponent={PatientSearchResult}
          valueComponent={PatientNameSelected} />
        {
          this.state.newPatient && <div>
            <NewPatientFormFieldsContainer />
          </div>
        }
        {
          this.props.value &&
          this.props.value.patient &&
          !isValid(missingPatientInfo(this.props.value.patient)) &&
            <div>
              <NewPatientFormFieldsContainer
                whitelistFields={Object.keys(missingPatientInfo(this.props.value.patient))} />
            </div>
        }
      </div>
    )
  }
}
