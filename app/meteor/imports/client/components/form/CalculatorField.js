import React from 'react'
import sum from 'lodash/sum'
import identity from 'lodash/identity'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'

const calculate = string => {
  const summands = string
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

  handleFocus () {
    this.setState({
      focus: true
    })

    if (this.props.input.meta.pristine) {
      this.setState({
        stringValue: ''
      })
    }

    if (!this.state.stringValue && this.props.input.value) {
      this.setState({
        stringValue: this.props.input.value
      })
    }
  }

  handleChange (e, stringValue) {
    this.setState({
      stringValue
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

    const finalValue = this.state.focus ? stringValue : inputValue
    return finalValue || ''
  }

  render () {
    const { input, ...props } = this.props
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
