import React from 'react'
import moment from 'moment-timezone'
import { withRouter } from 'react-router-dom'
import { Button, ButtonGroup } from 'react-bootstrap'
import { DayPickerSingleDateController } from 'react-dates'
import Portal from 'react-portal'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from './Icon'

class DateNavigationButtons extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      calendarOpen: false
    }

    this.goToDate = this.goToDate.bind(this)
    this.dateToPath = this.dateToPath.bind(this)
    this.handleBackwardMonthClick = this.handleBackwardMonthClick.bind(this)
    this.handleBackwardWeekClick = this.handleBackwardWeekClick.bind(this)
    this.handleBackwardDayClick = this.handleBackwardDayClick.bind(this)
    this.handleTodayClick = this.handleTodayClick.bind(this)
    this.handleForwardDayClick = this.handleForwardDayClick.bind(this)
    this.handleForwardWeekClick = this.handleForwardWeekClick.bind(this)
    this.handleForwardMonthClick = this.handleForwardMonthClick.bind(this)
    this.handleCalendarToggle = this.handleCalendarToggle.bind(this)
    this.handleCalendarClose = this.handleCalendarClose.bind(this)
    this.handleCalendarOpen = this.handleCalendarOpen.bind(this)
    this.handleCalendarDayChange = this.handleCalendarDayChange.bind(this)
    this.isToday = this.isToday.bind(this)
    this.isSelected = this.isSelected.bind(this)
  }

  dateToPath (date) {
    return `/${this.props.basePath}/${date.format('YYYY-MM-DD')}`
  }

  // TODO: Make less hacky and look at Schedules/holidays
  goToDate (date, round = 'next') {
    let targetDay = date
    if (targetDay.isoWeekday() === 7) {
      if (round === 'next') {
        targetDay = targetDay.add(1, 'day')
      } else {
        targetDay = targetDay.subtract(1, 'day')
      }
    }
    const path = this.dateToPath(targetDay)
    this.props.history.replace(path)
  }

  handleBackwardMonthClick () {
    this.goToDate(moment(this.props.date).subtract(1, 'month'), 'previous')
  }

  handleBackwardWeekClick () {
    this.goToDate(moment(this.props.date).subtract(1, 'week'), 'previous')
  }

  handleBackwardDayClick () {
    this.goToDate(moment(this.props.date).subtract(1, 'day'), 'previous')
  }

  handleTodayClick () {
    const path = this.dateToPath(moment())
    this.props.history.push(path)

    this.props.onTodayClick && this.props.onTodayClick()
  }

  handleForwardDayClick () {
    this.goToDate(moment(this.props.date).add(1, 'day'))
  }

  handleForwardWeekClick () {
    this.goToDate(moment(this.props.date).add(1, 'week'))
  }

  handleForwardMonthClick () {
    this.goToDate(moment(this.props.date).add(1, 'month'))
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

  handleCalendarDayChange (date) {
    const path = this.dateToPath(moment(date))
    this.props.history.replace(path)
  }

  isToday (day) {
    return day.isSame(moment(), 'day')
  }

  isSelected (day) {
    return day.isSame(this.props.date, 'day')
  }

  render () {
    return (
      <div className={`breadcrumbs page-actions hide-print ${this.props.pullRight && 'pull-right'}`}>
        <ButtonGroup>
          {this.props.before}

          {
            this.props.jumpMonthBackward &&
              <Button
                onClick={this.handleForwardMonthClick}
                title={TAPi18n.__('time.oneMonthBackward')}>
                <Icon name='angle-left' />
                <Icon name='angle-left' />
              </Button>
          }
          {
            this.props.jumpWeekBackward &&
              <Button
                onClick={this.handleForwardWeekClick}
                title={TAPi18n.__('time.oneWeekBackward')}>
                <Icon name='angle-double-left' />
              </Button>
          }

          <Button
            onClick={this.handleBackwardDayClick}
            title={TAPi18n.__('time.oneDayBackward')}>
            <Icon name='caret-left' />
          </Button>

          <Button
            onClick={this.handleTodayClick}>
            {TAPi18n.__('ui.today')}
          </Button>

          <Button
            onClick={this.handleForwardDayClick}
            title={TAPi18n.__('time.oneDayForward')}>
            <Icon name='caret-right' />
          </Button>

          {
            this.props.jumpWeekForward &&
              <Button
                onClick={this.handleForwardWeekClick}
                title={TAPi18n.__('time.oneWeekForward')}>
                <Icon name='angle-double-right' />
              </Button>
          }
          {
            this.props.jumpMonthForward &&
              <Button
                onClick={this.handleForwardMonthClick}
                title={TAPi18n.__('time.oneMonthForward')}>
                <Icon name='angle-right' />
                <Icon name='angle-right' />
              </Button>
          }

        </ButtonGroup>
        &nbsp;
        <ButtonGroup>

          <Button
            onMouseEnter={this.handleCalendarOpen}
            onClick={this.handleCalendarOpen}
            title={TAPi18n.__('time.calendar')}>
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
              <DayPickerSingleDateController
                onDateChange={this.handleCalendarDayChange}
                date={this.props.date}
                isDayHighlighted={this.isToday}
                focused
                initialVisibleMonth={() => this.props.date}
                enableOutsideDays
                hideKeyboardShortcutsPanel
                numberOfMonths={1}
              />
            </div>
          </div>
        </Portal>
      </div>
    )
  }
}

export const DateNavigation = withRouter(DateNavigationButtons)
