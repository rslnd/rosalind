import React from 'react'
import moment from 'moment-timezone'
import { monkey } from 'spotoninc-moment-round'
import { TAPi18n } from 'meteor/tap:i18n'
import { weekOfYear } from '../../../util/time/format'
import { DateNavigation } from '../../components/DateNavigation'
import { Icon } from '../../components/Icon'
import { AppointmentsView } from './AppointmentsView'
import { AppointmentsSearchContainer } from '../search/AppointmentsSearchContainer'
import { background } from '../../css/global'

const contentHeaderStyle = {
  background,
  display: 'flex',
  position: 'fixed',
  right: 0,
  left: 45,
  zIndex: 50
}

const printStyle = {
  display: 'inline-block',
  cursor: 'pointer',
  padding: 6
}

monkey(moment)

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
    return (
      <div>
        <div className='content-header hide-print' style={contentHeaderStyle}>
          <h1>
            <b>{this.props.calendar.name}</b>&ensp;
            {this.props.date.format(TAPi18n.__('time.dateFormatWeekdayShortNoYear'))}&nbsp;
            <small>
              {weekOfYear(this.props.date, { short: true })}
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
              date={this.props.date}
              onTodayClick={this.scrollToCurrentTime}
              basePath={`appointments/${this.props.calendar.slug}`}
              pullRight
              jumpWeekForward
              jumpMonthForward />
          </div>
        </div>

        <div className='content print-zoom-1'>
          <AppointmentsView
            assignees={this.props.assignees}
            date={this.props.date}
            daySchedule={this.props.daySchedule}
            calendar={this.props.calendar}
            canEditSchedules={this.props.canEditSchedules}
            onSetAdmitted={this.props.handleSetAdmitted}
            onMove={this.props.handleMove}
            onNewAppointmentModalOpen={this.props.onNewAppointmentModalOpen}
            onNewAppointmentModalClose={this.props.onNewAppointmentModalClose}
            move={this.props.move}
            dispatch={this.props.dispatch} />
        </div>

      </div>
    )
  }
}
