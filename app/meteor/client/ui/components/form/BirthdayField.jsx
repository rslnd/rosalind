import React from 'react'
import moment from 'moment-timezone'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { dayToDate } from 'util/time/day'
import { fuzzyBirthday } from 'util/fuzzy/fuzzyBirthday'

export class BirthdayField extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      stringValue: '',
      focus: false
    }

    this.handleBlur = this.handleBlur.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.renderValue = this.renderValue.bind(this)
  }

  handleFocus () {
    this.setState({
      ...this.state,
      focus: true
    })
  }

  handleChange (e, stringValue) {
    this.setState({
      ...this.state,
      stringValue
    })
  }

  handleBlur () {
    this.setState({
      ...this.state,
      focus: false
    })

    const day = fuzzyBirthday(this.state.stringValue)
    if (day && day.day && day.month && day.year) {
      this.props.input.onChange(day)
    } else {
      this.props.input.onChange(null)
    }
  }

  renderValue () {
    const inputValue = this.props.input.value
    const stringValue = this.state.stringValue

    if (this.state.focus) {
      return stringValue
    } else if (typeof inputValue === 'object' && inputValue.day && inputValue.month && inputValue.year) {
      const date = moment(dayToDate(inputValue))
      const formattedDate = date.format(TAPi18n.__('time.dateFormat'))
      const formattedAge = TAPi18n.__('patients.yearsOld', { age: moment().diff(date, 'years') })
      return `${formattedDate} (${formattedAge})`
    } else {
      return stringValue
    }
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
      onBlur={this.handleBlur} />
  }
}
