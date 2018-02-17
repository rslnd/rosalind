import React from 'react'
import moment from 'moment-timezone'
import { Button, ButtonGroup } from 'react-bootstrap'
import { DayPickerRangeController } from 'react-dates'
import { PortalWithState } from 'react-portal'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from './Icon'

export class DateRangeNavigation extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      focusedInput: 'startDate',
      startDate: this.props.start,
      endDate: this.props.end
    }

    this.handleCalendarOpen = this.handleCalendarOpen.bind(this)
    this.handleCalendarRangeChange = this.handleCalendarRangeChange.bind(this)
    this.handleFocusChange = this.handleFocusChange.bind(this)
    this.isFuture = this.isFuture.bind(this)
  }

  handleCalendarOpen ({ isOpen, openPortal }) {
    return (e) => {
      console.log({isOpen, e})
      if (isOpen) { return }
      openPortal()
      const bodyRect = document.body.getBoundingClientRect()
      const targetRect = e.currentTarget.getBoundingClientRect()

      this.setState({
        calendarPosition: {
          top: targetRect.bottom,
          right: bodyRect.right - targetRect.right - 30
        }
      })
    }
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
                  onMouseEnter={this.handleCalendarOpen({ isOpen, openPortal })}
                  title={TAPi18n.__('time.calendar')}>
                  {
                    this.props.calendarText &&
                      <span>{this.props.calendarText}&ensp;</span>
                  }
                  <Icon name='calendar' />
                </Button>

                {
                  portal(
                    isOpen && <div
                      className='hide-print'
                      style={{
                        position: 'fixed',
                        zIndex: 50,
                        marginRight: 30,
                        ...this.state.calendarPosition
                      }}>
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
