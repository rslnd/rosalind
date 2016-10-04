import React from 'react'
import moment from 'moment'
import { withRouter } from 'react-router'
import { Button, ButtonGroup } from 'react-bootstrap'
import DatePicker from 'material-ui/DatePicker'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from './Icon'

class DateNavigationButtons extends React.Component {
  constructor (props) {
    super(props)

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

  handleCalendarToggle () {
    this.refs.datePicker.openDialog()
  }

  handleCalendarDayChange (e, date) {
    const path = this.dateToPath(moment(date))
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

          <Button onClick={this.handleCalendarToggle} bsSize="small"><Icon name="calendar" /></Button>

          {this.props.children}
        </ButtonGroup>

        <DatePicker
          name="datePicker"
          ref="datePicker"
          autoOk
          value={this.props.date}
          onChange={this.handleCalendarDayChange}
          DateTimeFormat={Intl && Intl.DateTimeFormat}
          locale={'de-AT'}
          textFieldStyle={{ display: 'none' }}
          dialogContainerStyle={{ zoom: 0.9090, marginTop: '10px' }}
          container="inline" />

      </div>
    )
  }
}

export const DateNavigation = withRouter(DateNavigationButtons)
