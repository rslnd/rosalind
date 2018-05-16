import identity from 'lodash/identity'
import React from 'react'
import Select from 'react-select'
import { __ } from '../../i18n'
import { startCase } from '../../util/fuzzy/startCase'
import { findPatients } from './findPatients'
import { PatientSearchResult } from './PatientSearchResult'
import { PatientNameSelected } from './PatientNameSelected'

// Fuzzy-parse query for pre-filling new patient form
// TODO: Extract to method on Patients, merge with fuzzy birthday parsing
const parseQueryForAutofill = (query = '') => {
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

  console.log('[PatientPicker] Autofill')
  return { _id: 'newPatient', ...autofill }
}

export class PatientPicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      searchValue: null
    }
    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.handleSearchValueChange = this.handleSearchValueChange.bind(this)
  }

  handleQueryChange (query) {
    if (query && query.value) {
      this.props.input.onChange(query.value)
      this.props.loadPatient(query.patient || parseQueryForAutofill(query.query))
    } else {
      this.props.loadPatient(null)
      this.props.input.onChange(null)
      this.setState({
        searchValue: null
      })
    }
  }

  handleSearchValueChange (val) {
    this.setState({
      searchValue: val
    })
  }

  render () {
    return (
      <Select.Async
        name='patientPicker'
        value={this.props.injectedValue || this.props.input.value || null}
        loadOptions={findPatients}
        onChange={this.handleQueryChange}
        onInputChange={this.handleSearchValueChange}
        inputValue={this.state.searchValue}
        onBlur={() => this.props.input.onBlur(
          (this.props.injectedValue && this.props.injectedValue.patientId) ||
          this.props.input.value
        )}
        autoBlur
        cache={false}
        ignoreCase={false}
        ignoreAccents={false}
        autoFocus={this.props.autoFocus}
        placeholder={__('patients.search')}
        loadingPlaceholder={__('patients.searching')}
        clearValueText={__('ui.clear')}
        filterOptions={identity}
        optionComponent={PatientSearchResult}
        valueComponent={PatientNameSelected}
        onSelectResetsInput={false}
        onCloseResetsInput={false}
        onBlurResetsInput={false} />
    )
  }
}
