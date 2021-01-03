import React from 'react'
import moment from 'moment-timezone'
import { TextField } from './TextField'
import { __ } from '../../../i18n'
import { dayToDate } from '../../../util/time/day'
import { fuzzyBirthday } from '../../../util/fuzzy/fuzzyBirthday'

const toStringValue = v => {
  if (!v) { return '' }

  const date = moment(dayToDate(v))
  return date.format(__('time.dateFormat'))
}

export class DayField extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      stringValue: toStringValue(props.input && props.input.value || props.value),
      focus: false
    }

    this.handleBlur = this.handleBlur.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.renderValue = this.renderValue.bind(this)
  }

  componentWillReceiveProps(props) {
    if (!this.state.focus) {
      this.setState({
        stringValue: toStringValue(props.input && props.input.value || props.value)
      })
    }
  }

  handleFocus() {
    this.setState({
      focus: true
    })

    if (!this.state.stringValue && (this.props.input && this.props.input.value || this.props.value)) {
      this.setState({
        stringValue: toStringValue((this.props.input && this.props.input.value) || this.props.value)
      })
    }
  }

  handleChange(e) {
    this.setState({
      stringValue: e.target.value
    })
  }

  handleBlur(e) {
    this.setState({
      focus: false
    })

    const onBlur = (this.props.input && this.props.input.onBlur) || this.props.onBlur
    const onChange = (this.props.input && this.props.input.onChange) || this.props.onChange

    onBlur && onBlur(e)

    const day = fuzzyBirthday(this.state.stringValue)
    if (day && day.day && day.month && day.year) {
      onChange(day)
    } else {
      onChange(null)
    }
  }

  renderValue() {
    const inputValue = (this.props.input && this.props.input.value) || this.props.value
    const stringValue = this.state.stringValue

    if (this.state.focus) {
      return stringValue
    } else if (inputValue && typeof inputValue === 'object' && inputValue.day && inputValue.month && inputValue.year) {
      const date = moment(dayToDate(inputValue))
      const formattedDate = date.format(__('time.dateFormat'))

      if (this.props.birthday) {
        const formattedAge = __('patients.yearsOld', { age: moment().diff(date, 'years').toString() })
        return `${formattedDate} (${formattedAge})`
      } else {
        return formattedDate
      }
    } else {
      return stringValue
    }
  }

  render() {
    const { input, value, birthday, plain, ...props } = this.props

    if (plain) {
      return <input
        {...props}
        value={this.renderValue()}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onChange={this.handleChange}
      />
    } else {
      const { onBlur, onFocus, onChange, value, ...keepInput } = (this.props.input || this.props)

      return <TextField
        {...props}
        input={keepInput}
        value={this.renderValue()}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onChange={this.handleChange}
      />
    }
  }
}
