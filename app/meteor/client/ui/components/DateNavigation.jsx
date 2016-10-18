import React from 'react'
import moment from 'moment'
import { withRouter } from 'react-router'
import { Button, ButtonGroup } from 'react-bootstrap'
import { DayPicker } from 'react-dates'
import Portal from 'react-portal'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from './Icon'
import style from './datePickerStyles'

class DateNavigationButtons extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      calendarOpen: false
    }

    this.handlePreviousClick = this.handlePreviousClick.bind(this)
    this.handleNextClick = this.handleNextClick.bind(this)
    this.handleTodayClick = this.handleTodayClick.bind(this)
    this.handleCalendarToggle = this.handleCalendarToggle.bind(this)
    this.handleCalendarDayChange = this.handleCalendarDayChange.bind(this)
  }

  dateToPath (date) {
    return `/${this.props.basePath}/${date.format('YYYY-MM-DD')}`
  }

  // TODO: Make less hacky and look at Schedules/holidays
  handlePreviousClick () {
    let previousDay = moment(this.props.date).subtract(1, 'day')
    if (previousDay.isoWeekday() === 7) { previousDay = previousDay.subtract(1, 'day') }
    const path = this.dateToPath(previousDay)
    this.props.router.replace(path)
  }

  handleNextClick () {
    let nextDay = moment(this.props.date).add(1, 'day')
    if (nextDay.isoWeekday() === 7) { nextDay = nextDay.add(1, 'day') }
    const path = this.dateToPath(nextDay)
    this.props.router.replace(path)
  }

  handleTodayClick () {
    const path = this.dateToPath(moment())
    this.props.router.push(path)
  }

  handleCalendarToggle (e) {
    const bodyRect = document.body.getBoundingClientRect()
    const targetRect = e.currentTarget.getBoundingClientRect()

    this.setState({
      ...this.state,
      calendarOpen: !this.state.calendarOpen,
      calendarPosition: {
        top: targetRect.bottom,
        right: targetRect.right - bodyRect.right
      }
    })
  }

  handleCalendarDayChange (date) {
    const path = this.dateToPath(date)
    this.props.router.replace(path)
  }

  render () {
    return (
      <div className={`breadcrumbs page-actions ${this.props.pullRight && 'pull-right'}`}>
        <ButtonGroup>
          {this.props.before}

          <Button onClick={this.handlePreviousClick}>
            <Icon name="caret-left" />
          </Button>

          <Button onClick={this.handleTodayClick}>{TAPi18n.__('ui.today')}</Button>

          <Button onClick={this.handleNextClick}>
            <Icon name="caret-right" />
          </Button>

          <Button onClick={this.handleCalendarToggle}>
            <Icon name="calendar" />
          </Button>

          {this.props.children}
        </ButtonGroup>

        <Portal
          closeOnEsc
          closeOnOutsideClick
          isOpened={this.state.calendarOpen}>
          <div
            className={style.portal}
            style={this.state.calendarPosition}>
            <DayPicker
              onDayMouseDown={this.handleCalendarDayChange}
              date={this.props.date}
              initialVisibleMonth={() => this.props.date}
              enableOutsideDays
              modifiers={{
                current: (day) => day.isSame(this.props.date, 'day')
              }}
            />
          </div>
        </Portal>
      </div>
    )
  }
}

export const DateNavigation = withRouter(DateNavigationButtons)
