import React from 'react'
import Select from 'react-select'
import { __ } from '../../i18n'

export const Search = ({ value, onChange, searchRef }) =>
  <Select
    ref={searchRef}
    inputValue={value}
    onInputChange={onChange}
    ignoreCase
    isClearable
    autoFocus
    components={components}
    menuIsOpen={false}
    placeholder={__('tags.searchTags')}
  />

const components = {
  DropdownIndicator: null
}
