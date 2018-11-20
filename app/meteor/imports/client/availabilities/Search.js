import React from 'react'
import Select from 'react-select'
import { __ } from '../../i18n'

export const Search = ({ value, onChange, autoFocus }) =>
  <Select
    inputValue={value}
    onInputChange={onChange}
    ignoreCase
    isClearable
    components={components}
    menuIsOpen={false}
    autoFocus
    placeholder={__('tags.searchTags')}
  />

const components = {
  DropdownIndicator: null
}
