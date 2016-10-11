import React from 'react'
import moment from 'moment'
import { withRouter } from 'react-router'
import { Button, ButtonGroup } from 'react-bootstrap'
import { DayPicker } from 'react-dates'
import Popover from 'material-ui/Popover'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from './Icon'
import './datePickerStyles'

class DateNavigationButtons extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      calendarOpen: false
    }

    this.handlePreviousClick = this.handlePreviousClick.bind(this)
    this.handleNextClick = this.handleNextClick.bind(this)
    this.handleTodayClick = this.handleTodayClick.bind(this)
    this.handleCalendarOpen = this.handleCalendarOpen.bind(this)
    this.handleCalendarClose = this.handleCalendarClose.bind(this)
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

  handleCalendarOpen (e) {
    this.setState({
      ...this.state,
      calendarOpen: true,
      calendarAnchor: e.currentTarget
    })
  }

  handleCalendarClose () {
    this.setState({ ...this.state, calendarOpen: false })
  }

  handleCalendarDayChange (date) {
    const path = this.dateToPath(date)
    this.props.router.replace(path)
  }

  render () {
    return (
      <div className={`breadcrumbs page-actions ${this.props.pullRight && 'pull-right'}`}>
        <ButtonGroup>
          <Button onClick={this.handlePreviousClick} bsSize="small">
            <Icon name="caret-left" />
          </Button>

          <Button onClick={this.handleTodayClick} bsSize="small">{TAPi18n.__('ui.today')}</Button>

          <Button onClick={this.handleNextClick} bsSize="small">
            <Icon name="caret-right" />
          </Button>

          <Button
            onClick={this.handleCalendarOpen}
            ref="calendarToggle"
            bsSize="small">
            <Icon name="calendar" />
          </Button>

          {this.props.children}
        </ButtonGroup>

        <Popover
          open={this.state.calendarOpen}
          anchorEl={this.state.calendarAnchor}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          autoCloseWhenOffScreen={false}
          onRequestClose={this.handleCalendarClose}
          >
          <div style={{ zoom: 0.9090 }}>
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
        </Popover>
      </div>
    )
  }
}

export const DateNavigation = withRouter(DateNavigationButtons)
