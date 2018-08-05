import React from 'react'
import Select from 'react-select'
import { withProps } from 'recompose'
import { Icon } from '../../components/Icon'
import { __ } from '../../../i18n'
import { Loading } from '../../components/Loading'

const loadingStyle = {
  margin: 0,
  marginTop: 5
}

const components = {
  LoadingIndicator: withProps({ size: 16, style: loadingStyle })(Loading)
}

const noOptionsMessage = () => __('patients.noResults')
const loadingMessage = () => __('patients.searching')

export const PatientPickerComponent = ({
  selectState,
  selectHandlers,
  CustomOptionComponent,
  isOptionSelected,
  filterOption
}) =>
  <Select
    {...selectState}
    {...selectHandlers}
    formatOptionLabel={CustomOptionComponent}
    isOptionSelected={isOptionSelected}
    filterOption={filterOption}
    isClearable
    components={components}
    noOptionsMessage={noOptionsMessage}
    loadingMessage={loadingMessage}
    placeholder={__('patients.search')}
  />

export const NewPatient = () =>
  <span><Icon name='user-plus' /> {__('patients.thisInsert')}</span>
