import React from 'react'
import moment from 'moment-timezone'
import Button from 'react-bootstrap/lib/Button'
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup'
import { DayPickerRangeController } from 'react-dates'
import { START_DATE, END_DATE } from 'react-dates/constants'
import { PortalWithState } from 'react-portal'
import { __ } from '../../i18n'
import { Icon } from './Icon'
import { calendarStyle, calendarStyleOpen } from './DateNavigation'

export class DateRangeNavigation extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      focusedInput: START_DATE,
      startDate: this.props.start,
      endDate: this.props.end
    }

    this.handleCalendarRangeChange = this.handleCalendarRangeChange.bind(this)
    this.handleFocusChange = this.handleFocusChange.bind(this)
    this.isFuture = this.isFuture.bind(this)
  }

  handleFocusChange (focusedInput) {
    if (focusedInput === END_DATE) {
      this.setState({ endDate: null })
    }

    this.setState({ focusedInput: focusedInput || START_DATE })
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
      <PortalWithState
        closeOnEsc
      >
        {
          ({ openPortal, closePortal, isOpen, portal }) =>
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
                  onMouseEnter={openPortal}
                  title={__('time.calendar')}>
                  {
                    this.props.calendarText &&
                      <span>{this.props.calendarText}&ensp;</span>
                  }
                  <Icon name='calendar' />
                </Button>

                {
                  portal(
                    <div
                      className='hide-print'
                      style={isOpen ? calendarStyleOpen : calendarStyle}>
                      <div onMouseLeave={closePortal}>
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
                  )
                }
              </ButtonGroup>
              {this.props.children}
            </div>
        }
      </PortalWithState>
    )
  }
}
