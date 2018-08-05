import React from 'react'
import Select from 'react-select'
import { Icon } from '../../components/Icon'
import { __ } from '../../../i18n'

export const PatientPickerComponent = ({
  selectState,
  selectHandlers,
  CustomOptionComponent,
  isOptionSelected
}) =>
  <Select
    {...selectState}
    {...selectHandlers}
    formatOptionLabel={CustomOptionComponent}
    isOptionSelected={isOptionSelected}
    isClearable
  />

export const NewPatient = () =>
  <span><Icon name='user-plus' /> {__('patients.thisInsert')}</span>
