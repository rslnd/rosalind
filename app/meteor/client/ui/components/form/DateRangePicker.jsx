import React from 'react'
import moment from 'moment-timezone'
import { TAPi18n } from 'meteor/tap:i18n'
import { DateRangePicker as DateRangePickerComponent } from 'react-dates'
import { START_DATE, END_DATE } from 'react-dates/constants'
import './datePickerStyles.scss'

export class DateRangePicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      focusedInput: null
    }

    this.onDatesChange = this.onDatesChange.bind(this)
    this.onFocusChange = this.onFocusChange.bind(this)
  }

  onDatesChange ({ startDate, endDate }) {
    let { focusedInput } = this.state

    if (focusedInput === END_DATE && endDate == null) {
      endDate = startDate
    }

    if (focusedInput === START_DATE) {
      focusedInput = END_DATE
      endDate = null
    }

    const start = startDate ? startDate.toDate() : null
    const end = endDate ? endDate.toDate() : null

    this.props.start.input.onChange(start)
    this.props.end.input.onChange(end)

    this.setState({ focusedInput })
  }

  onFocusChange (focusedInput) {
    this.setState({ focusedInput })
  }

  render () {
    const { start, end } = this.props
    return (
      <div>
        <DateRangePickerComponent
          {...this.props}
          showDefaultInputIcon
          showClearDates
          startDatePlaceholderText={TAPi18n.__('ui.startDate')}
          endDatePlaceholderText={TAPi18n.__('ui.endDate')}
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={this.state.focusedInput}
          startDate={start.input.value ? moment(start.input.value) : null}
          endDate={end.input.value ? moment(end.input.value) : null}
          minimumNights={0}
        />
      </div>
    )
  }
}
