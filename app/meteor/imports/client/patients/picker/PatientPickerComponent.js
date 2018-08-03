import React from 'react'
import Select from 'react-select'

export const PatientPickerComponent = ({ inputValue, handleInputValueChange }) =>
  <Select
    inputValue={inputValue}
    onInputChange={handleInputValueChange}
    options={[
      { a: 'b' }
    ]}
  />
