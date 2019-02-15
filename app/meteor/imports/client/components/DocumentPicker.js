import React from 'react'
import Select from 'react-select'
import { __ } from '../../i18n'
import { getStyleNonce } from '../layout/styles'

const toOption = props => doc => {
  return doc ? {
    value: props.toKey ? props.toKey(doc) : doc._id,
    label: props.toLabel(doc)
  } : null
}

const toInitialOptions = (props) => {
  if (props.initialValue) {
    if (props.isMulti) {
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
      placeholder
    } = this.props

    return (
      <Select
        value={
          (value || isStateless)
          ? toOption(this.props)(toDocument(value))
          : this.state.query
        }
        onChange={this.handleQueryChange}
        formatOptionLabel={render}
        options={options(this.props).map(toOption(this.props))}
        ignoreCase
        isClearable
        isMulti={isMulti}
        styles={customStyles}
        autoFocus={autoFocus || false}
        placeholder={placeholder || __('ui.select')}
        nonce={getStyleNonce()}
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
