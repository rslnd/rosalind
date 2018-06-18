import React from 'react'
import sum from 'lodash/sum'
import identity from 'lodash/identity'
import { TextField } from './TextField'
import { TAPi18n } from 'meteor/tap:i18n'

const calculate = (string = '') => {
  const summands = string
    .toString()
    .replace(/,/g, '.')
    .split(/\+|\s/)
    .map(parseFloat)
    .filter(identity)

  return sum(summands)
}

export class CalculatorField extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      stringValue: props.input.value,
      focus: false
    }

    this.handleBlur = this.handleBlur.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.renderValue = this.renderValue.bind(this)
  }

  componentWillReceiveProps (props) {
    if (!this.state.focus && calculate(this.state.stringValue) != props.input.value) {
      this.setState({
        stringValue: props.input.value
      })
    }
  }

  handleFocus () {
    this.setState({
      focus: true
    })

    if (!this.state.stringValue && this.props.input.value) {
      this.setState({
        stringValue: this.props.input.value
      })
    }
  }

  handleChange (e) {
    this.setState({
      stringValue: e.target.value
    })
  }

  handleBlur () {
    this.setState({
      focus: false
    })
  }

  handleKeyUp () {
    const result = calculate(this.state.stringValue)
    if (result) {
      this.props.input.onChange(result)
    } else {
      this.props.input.onChange(null)
    }
  }

  renderValue () {
    const inputValue = this.props.input.value
    const stringValue = this.state.stringValue

    const formatter = this.props.formatter

    const finalValue = this.state.focus ? stringValue : formatter(inputValue)

    if (!finalValue && !this.props.meta.touched) {
      return ''
    } else {
      return (finalValue || '')
    }
  }

  render () {
    const { input, formatter, ...props } = this.props
    const { onBlur, onFocus, onChange, value, ...keepInput } = this.props.input

    return <TextField
      {...props}
      input={keepInput}
      value={this.renderValue()}
      onChange={this.handleChange}
      onFocus={this.handleFocus}
      onBlur={this.handleBlur}
      onKeyUp={this.handleKeyUp} />
  }
}
