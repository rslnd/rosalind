import identity from 'lodash/identity'
import React from 'react'
import moment from 'moment-timezone'
import { TextField } from './TextField'
import { __ } from '../../../i18n'
import { dayToDate } from '../../../util/time/day'
import { fuzzyBirthday } from '../../../util/fuzzy/fuzzyBirthday'

const toStringValue = (day, text) => {
  if (!day) { return '' }

  const date = moment(dayToDate(day)).format(__('time.dateFormat'))
  const note = text && text.trim()

  return [date, note].filter(identity).join(' ')
}

export class DayNoteField extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      stringValue: toStringValue(props.day.input.value, props.note.input.value),
      focus: false
    }

    this.handleBlur = this.handleBlur.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.renderValue = this.renderValue.bind(this)
    this.parseFuzzy = this.parseFuzzy.bind(this)
  }

  componentWillReceiveProps (props) {
    if (!this.state.focus) {
      this.setState({
        stringValue: toStringValue(props.day.input.value, props.note.input.value)
      })
    }
  }

  handleFocus () {
    this.setState({
      focus: true
    })

    if (!this.state.stringValue && this.props.day.input.value) {
      this.setState({
        stringValue: toStringValue(this.props.day.input.value, props.note.input.value)
      })
    }
  }

  handleChange (e) {
    const stringValue = e.target.value
    this.setState({
      stringValue
    })

    this.parseFuzzy(stringValue)
  }

  handleBlur () {
    this.setState({
      focus: false
    })

    this.parseFuzzy()
  }

  parseFuzzy (stringValue) {
    const { day, month, year, note } = fuzzyBirthday(stringValue || this.state.stringValue)

    this.props.note.input.onChange(note)

    if (day && month && year) {
      this.props.day.input.onChange({ day, month, year })
    } else {
      this.props.day.input.onChange(null)
    }
  }

  renderValue () {
    const day = this.props.day.input.value
    const note = this.props.note.input.value
    const stringValue = this.state.stringValue

    if (this.state.focus) {
      return stringValue
    } else if (day && typeof day === 'object' && day.day && day.month && day.year) {
      const date = moment(dayToDate(day))
      const formattedDate = date.format(__('time.dateFormat'))

      return [
        formattedDate,
        note
      ].filter(identity).join(' ')
    } else {
      return stringValue
    }
  }

  render () {
    const { day, note, ...props } = this.props
    const { onBlur, onFocus, onChange, value, ...keepInput } = day.input

    return <TextField
      {...props}
      input={keepInput}
      value={this.renderValue()}
      onChange={this.handleChange}
      onFocus={this.handleFocus}
      onBlur={this.handleBlur} />
  }
}
