import React from 'react'
import moment from 'moment-timezone'
import { Button, ButtonGroup } from 'react-bootstrap'
import { DayPickerRangeController } from 'react-dates'
import Portal from 'react-portal'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from './Icon'

export class DateRangeNavigation extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      calendarOpen: false,
      focusedInput: 'startDate',
      startDate: this.props.start,
      endDate: this.props.end
    }

    this.handleCalendarToggle = this.handleCalendarToggle.bind(this)
    this.handleCalendarClose = this.handleCalendarClose.bind(this)
    this.handleCalendarOpen = this.handleCalendarOpen.bind(this)
    this.handleCalendarRangeChange = this.handleCalendarRangeChange.bind(this)
    this.handleFocusChange = this.handleFocusChange.bind(this)
    this.isFuture = this.isFuture.bind(this)
  }

  handleCalendarToggle (e) {
    if (this.state.calendarOpen) {
      this.handleCalendarClose()
    } else {
      this.handleCalendarOpen(e)
    }
  }

  handleCalendarClose () {
    this.setState({
      ...this.state,
      calendarOpen: false
    })
  }

  handleCalendarOpen (e) {
    const bodyRect = document.body.getBoundingClientRect()
    const targetRect = e.currentTarget.getBoundingClientRect()

    this.setState({
      ...this.state,
      calendarOpen: true,
      calendarPosition: {
        top: targetRect.bottom,
        right: bodyRect.right - targetRect.right - 30
      }
    })
  }

  handleFocusChange (focusedInput) {
    this.setState({ focusedInput: !focusedInput ? 'startDate' : focusedInput })
  }

  handleCalendarRangeChange ({ startDate, endDate }) {
    this.setState({ startDate, endDate })

    if (startDate && endDate) {
      this.props.onRangeChange({ start: startDate, end: endDate })
    }
  }

  isFuture (day) {
    return day.isAfter(moment(), 'day')
  }

  render () {
    return (
      <div className={`breadcrumbs page-actions hide-print ${this.props.pullRight && 'pull-right'}`}>
        {
          this.props.before &&
            <ButtonGroup>
              {this.props.before}
            </ButtonGroup>
        }
        &nbsp;
        <ButtonGroup>

          <Button
            onMouseEnter={this.handleCalendarOpen}
            onClick={this.handleCalendarOpen}
            title={TAPi18n.__('time.calendar')}>
            {
              this.props.calendarText &&
                <span>{this.props.calendarText}&ensp;</span>
            }
            <Icon name='calendar' />
          </Button>

          {this.props.children}
        </ButtonGroup>

        <Portal
          closeOnEsc
          closeOnOutsideClick
          onClose={this.handleCalendarClose}
          isOpened={this.state.calendarOpen}>
          <div
            className='hide-print'
            style={{
              position: 'fixed',
              zIndex: 50,
              marginRight: 30,
              ...this.state.calendarPosition
            }}>
            <div onMouseLeave={this.handleCalendarClose}>
              <DayPickerRangeController
                onDatesChange={this.handleCalendarRangeChange}
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                focusedInput={this.state.focusedInput}
                onFocusChange={this.handleFocusChange}
                initialVisibleMonth={() => moment().subtract(1, 'month')}
                minimumNights={0}
                isOutsideRange={this.isFuture}
                enableOutsideDays={false}
                hideKeyboardShortcutsPanel
                numberOfMonths={2}
              />
            </div>
          </div>
        </Portal>
      </div>
    )
  }
}
