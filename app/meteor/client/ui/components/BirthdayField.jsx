import React from 'react'
import moment from 'moment'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { dayToDate } from 'util/time/day'
import { fuzzyBirthday } from 'util/fuzzy/fuzzyBirthday'

export class BirthdayField extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      previousValue: null
    }

    this.handleBlur = this.handleBlur.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.renderValue = this.renderValue.bind(this)
  }

  handleFocus () {
    const previousValue = this.state.previousValue
    this.props.input.onChange(previousValue)
  }

  handleBlur () {
    const value = this.props.input.value
    if (typeof value === 'string') {
      this.setState({ previousValue: value })
      const day = fuzzyBirthday(value)
      this.props.input.onChange(day)
    }
  }

  renderValue () {
    const value = this.props.input.value
    if (typeof value === 'string') {
      return value
    } else if (typeof value === 'object' && value.day && value.month && value.year) {
      const date = moment(dayToDate(value))
      const formattedDate = date.format(TAPi18n.__('time.dateFormat'))
      const formattedAge = TAPi18n.__('patients.yearsOld', { age: moment().diff(date, 'years') })
      return `${formattedDate} (${formattedAge})`
    } else {
      return ''
    }
  }

  render () {
    return <TextField
      {...this.props}
      value={this.renderValue()}
      onFocus={this.handleFocus}
      onBlur={this.handleBlur} />
  }
}
