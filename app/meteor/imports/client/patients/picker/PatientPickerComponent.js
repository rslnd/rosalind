import React from 'react'
import Select from 'react-select'
import { PatientName } from '../PatientName'

const CustomValue = (value) => <PatientName patient={value} />

const isOptionSelected = ({ _id }, selected = []) =>
  selected.some(s => s._id === _id)

export const PatientPickerComponent = ({
  selectState,
  selectHandlers,
}) =>
  <Select
    {...selectState}
    {...selectHandlers}
    formatOptionLabel={CustomValue}
    isOptionSelected={isOptionSelected}
  />
