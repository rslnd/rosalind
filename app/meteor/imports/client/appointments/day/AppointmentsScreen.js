import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { TAPi18n } from 'meteor/tap:i18n'
import { weekOfYear } from '../../../util/time/format'
import { DateNavigation } from '../../components/DateNavigation'
import { Icon } from '../../components/Icon'
import { AppointmentsSearchContainer } from '../search/AppointmentsSearchContainer'
import { background } from '../../css/global'
import { GridContainer } from './GridContainer'

const contentHeaderStyle = {
  background,
  display: 'flex',
  width: '100%'
}

const printStyle = {
  display: 'inline-block',
  cursor: 'pointer',
  padding: 6
}

export class AppointmentsScreen extends React.Component {
  constructor (props) {
    super(props)

    this.scrollToCurrentTime = this.scrollToCurrentTime.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
  }

  scrollToCurrentTime () {
    const now = moment()
    if (now.isSame(this.props.date, 'day')) {
      const elemId = now.floor(5, 'minutes').format('[T]HHmm')
      const offset = document.getElementById(elemId).offsetTop
      window.scrollTo({ top: offset })
      console.log('[AppointmentsScreen] Scrolled to', document.getElementById(elemId), offset)
    }
  }

  handlePrint () {
    if (window.native) {
      console.log('[Client] Printing: native')
      const title = moment(this.props.date)
        .format(`YYYY-MM-DD-${TAPi18n.__('appointments.this')}-${this.props.calendar.name}`)
      window.native.print({ title })
    } else {
      console.log('[Client] Printing: default')
      window.print()
    }
  }

  render () {
    const { calendar, date } = this.props

    return (
      <div>
        <div className='content-header hide-print' style={contentHeaderStyle}>
          <h1>
            <b>{calendar.name}</b>
            &ensp;
            {date.format(TAPi18n.__('time.dateFormatWeekdayShortNoYear'))}
            &nbsp;
            <small>
              {weekOfYear(date, { short: true })}
              &nbsp;
              <span
                style={printStyle}
                title={TAPi18n.__('appointments.printDayView')}
                onClick={this.handlePrint}>
                <Icon name='print' />
              </span>
            </small>
          </h1>

          <div style={{ marginLeft: 30, marginRight: 15, flexGrow: 1 }}>
            <AppointmentsSearchContainer />
          </div>

          <div style={{ marginTop: 27 }}>
            <DateNavigation
              date={date}
              onTodayClick={this.scrollToCurrentTime}
              basePath={`appointments/day/${calendar.slug}`}
              pullRight
              jumpWeekForward
              jumpMonthForward />
          </div>
        </div>

        <GridContainer
          calendar={calendar}
          date={date}
        />
      </div>
    )
  }
}

AppointmentsScreen.propTypes = {
  date: PropTypes.object.isRequired,
  calendar: PropTypes.object.isRequired
}
