import React from 'react'
import Select from 'react-select'
import { __ } from '../../i18n'
import { getStyleNonce } from '../layout/styles'

export const Search = ({ value, onChange, focusRef, style, ...props }) =>
  <div style={style}>
    <Select
      ref={focusRef}
      inputValue={value}
      onInputChange={onChange}
      ignoreCase
      isClearable
      autoFocus
      components={components}
      menuIsOpen={false}
      placeholder={__('tags.searchTags')}
      nonce={getStyleNonce()}
      {...props}
    />
  </div>

const components = {
  DropdownIndicator: null
}
