import React from 'react'
import Select from 'react-select'
import { __ } from '../../i18n'

const toOption = props => doc => {
  return doc ? {
    value: doc._id,
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
    this.setState({
      ...this.state,
      query: query
    })

    if (this.props.onChange && query) {
      if (this.props.isMulti && query.length >= 1) {
        this.props.onChange(query.map(q => q.value))
      } else {
        this.props.onChange(query.value)
      }
    } else {
      this.props.onChange(null)
    }
  }

  render () {
    return (
      <Select
        value={this.state.query}
        onChange={this.handleQueryChange}
        options={this.props.options(this.props).map(toOption(this.props))}
        ignoreCase
        isClearable
        isMulti={this.props.isMulti}
        styles={customStyles}
        autoFocus={this.props.autoFocus || false}
        placeholder={this.props.placeholder || __('ui.select')} />
    )
  }
}

const customStyles = {
  menu: (base) => ({
    ...base,
    zIndex: 3
  })
}
