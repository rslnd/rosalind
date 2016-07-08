import React from 'react'
import moment from 'moment'
import { withRouter } from 'react-router'
import { Button, ButtonGroup } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from './Icon'

class DateNavigationButtons extends React.Component {
  constructor (props) {
    super(props)

    this.handlePreviousClick = this.handlePreviousClick.bind(this)
    this.handleNextClick = this.handleNextClick.bind(this)
    this.handleTodayClick = this.handleTodayClick.bind(this)
  }

  dateToPath (date) {
    return `/${this.props.basePath}/${date.format('YYYY-MM-DD')}`
  }

  handlePreviousClick () {
    const path = this.dateToPath(moment(this.props.date).subtract(1, 'day'))
    this.props.router.replace(path)
  }

  handleNextClick () {
    const path = this.dateToPath(moment(this.props.date).add(1, 'day'))
    this.props.router.replace(path)
  }

  handleTodayClick () {
    const path = this.dateToPath(moment())
    this.props.router.push(path)
  }

  render () {
    return (
      <div className="breadcrumbs page-actions">
        <ButtonGroup>
          <Button onClick={this.handlePreviousClick} bsSize="small">
            <Icon name="caret-left" />
          </Button>

          <Button onClick={this.handleTodayClick} bsSize="small">{TAPi18n.__('ui.today')}</Button>

          <Button onClick={this.handleNextClick} bsSize="small">
            <Icon name="caret-right" />
          </Button>

          <Button bsSize="small"><Icon name="calendar" /></Button>
        </ButtonGroup>
      </div>
    )
  }
}

export const DateNavigation = withRouter(DateNavigationButtons)
