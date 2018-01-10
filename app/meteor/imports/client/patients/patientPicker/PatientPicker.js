import identity from 'lodash/identity'
import React from 'react'
import Select from 'react-select'
import { TAPi18n } from 'meteor/tap:i18n'
import { startCase } from '../../../util/fuzzy/startCase'
import { findPatients } from './findPatients'
import { NewPatientFormFields } from './NewPatientFormFields'
import { PatientSearchResult } from './PatientSearchResult'
import { PatientNameSelected } from './PatientNameSelected'
import { isEmpty, missingPatientInfo } from './missingPatientInfo'

export class PatientPicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      upserting: false,
      searchValue: null
    }
    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.handleCloseUpsert = this.handleCloseUpsert.bind(this)
    this.handleOpenUpsert = this.handleOpenUpsert.bind(this)
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

    autofill.contacts = [
      { channel: 'Phone' },
      { channel: 'Email' }
    ]

    console.log('[PatientPicker] Autofill', { query, autofill })
    return autofill
  }

  handleQueryChange (query) {
    if (query) {
      const missingFields = query.patient && missingPatientInfo(query.patient)
      const needsMoreInfo = missingFields && !isEmpty(missingFields)
      if (query.newPatient || this.props.alwaysUpsert || needsMoreInfo) {
        this.handleOpenUpsert(query)
      } else {
        this.handleCloseUpsert()
      }

      if (this.props.input.onChange) {
        console.log('[PatientPicker] onChange', query.value ? query.value : '')
        this.props.input.onChange(query.value ? query.value : '')
      }
    } else {
      console.log('[PatientPicker] no query, closing new patient form')
      if (this.props.input.onChange) {
        this.props.input.onChange(null)
      }
      this.setState({
        searchValue: null
      })
      this.handleCloseUpsert()
    }
  }

  handleOpenUpsert (query) {
    if (query.newPatient) {
      const autofill = this.parseQueryForAutofill(query.query)
      this.props.dispatch({ type: 'OPEN_NEW_PATIENT', autofill })
    } else {
      this.props.dispatch({ type: 'OPEN_UPSERT' })
    }

    this.setState({
      upsert: true,
      searchValue: null
    })
  }

  handleCloseUpsert () {
    this.props.dispatch({ type: 'CLOSE_UPSERT' })
    this.setState({
      upsert: false,
      searchValue: null
    })
  }

  handleSearchValueChange (val) {
    this.setState({
      searchValue: val
    })
  }

  render () {
    let whitelistFields = null
    if (this.props.value &&
      this.props.value.patient &&
      !this.props.extended &&
      !this.props.alwaysUpsert) {
      whitelistFields = Object.keys(missingPatientInfo(this.props.value.patient))
    }

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
          autoFocus={this.props.autoFocus && !this.props.value}
          placeholder={TAPi18n.__('patients.search')}
          loadingPlaceholder={TAPi18n.__('patients.searching')}
          clearValueText={TAPi18n.__('ui.clear')}
          filterOptions={identity}
          optionComponent={PatientSearchResult}
          valueComponent={PatientNameSelected} />
        {
          this.state.upsert && <div>
            <NewPatientFormFields
              extended={this.props.extended}
              whitelistFields={whitelistFields} />
          </div>
        }
      </div>
    )
  }
}
