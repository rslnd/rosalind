import React from 'react'
import identity from 'lodash/identity'
import Select from 'react-select'
import { __ } from '../../i18n'
import { getStyleNonce } from '../layout/styles'

const filterOption = (candidate, input) => {
  if (input) {
    return candidate.label.toLowerCase().indexOf(input.toLowerCase()) !== -1
  }

  return true
}

const toOption = props => doc => {
  return doc ? {
    ...doc,
    value: props.toKey ? props.toKey(doc) : doc._id,
    label: props.toLabel(doc)
  } : null
}

const toInitialOptions = (props) => {
  if (props.initialValue) {
    if (props.isMulti && props.initialValue.map) {
      return props.initialValue.map(props.toDocument).map(toOption(props))
    } else {
      return toOption(props)(props.toDocument(props.initialValue))
    }
  }
}

export class DocumentPicker extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      query: toInitialOptions(props) || ''
    }

    this.handleQueryChange = this.handleQueryChange.bind(this)
  }

  handleQueryChange (query) {
    const { onChange, isMulti } = this.props

    this.setState({
      query: query
    })

    if (onChange && query) {
      if (isMulti && query.length >= 1) {
        onChange(query.map(q => q.value))
      } else {
        onChange(query.value)
      }
    } else {
      onChange(null)
    }
  }

  render () {
    const {
      value,
      isStateless,
      render,
      options,
      toDocument,
      isMulti,
      autoFocus,
      placeholder,
      filter,

      // don't pass these props on to Select:
      selector,
      toLabel,
      onChange,

      // these break redux-form?
      onBlur,
      onFocus,
      ...selectProps
    } = this.props

    console.log('sP', selectProps)

    return (
      <Select
        value={
          (value || isStateless)
            ? ((isMulti && value)
              ? value.map(toDocument).map(toOption(this.props))
              : toOption(this.props)(toDocument(value)))
            : this.state.query
        }
        onChange={this.handleQueryChange}
        formatOptionLabel={render}
        options={options(this.props).filter(filter || identity).map(toOption(this.props))}
        ignoreCase
        isClearable
        isMulti={isMulti}
        styles={customStyles}
        autoFocus={autoFocus || false}
        placeholder={placeholder || __('ui.select')}
        nonce={getStyleNonce()}
        filterOption={filterOption}
        {...selectProps}
      />
    )
  }
}

const customStyles = {
  menu: (base) => ({
    ...base,
    zIndex: 3
  })
}
