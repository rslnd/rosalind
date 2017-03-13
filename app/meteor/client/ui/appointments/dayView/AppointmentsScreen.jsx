import React from 'react'
import moment from 'moment'
import { monkey } from 'spotoninc-moment-round'
import classnames from 'classnames'
import { TAPi18n } from 'meteor/tap:i18n'
import { weekOfYear } from 'util/time/format'
import { DateNavigation } from 'client/ui/components/DateNavigation'
import { AppointmentsView } from './AppointmentsView'
import { AppointmentsSearchContainer } from 'client/ui/appointments/search/AppointmentsSearchContainer'
import style from './appointmentsScreenStyle'

monkey(moment)

export class AppointmentsScreen extends React.Component {
  constructor (props) {
    super(props)

    this.scrollToCurrentTime = this.scrollToCurrentTime.bind(this)
  }

  scrollToCurrentTime () {
    const now = moment()
    if (now.isSame(this.props.date, 'day')) {
      const elemId = now.floor(5, 'minutes').format('H:mm')
      const offset = document.getElementById(elemId).offsetTop
      window.scrollTo({ top: offset })
      console.log('scrolledto', document.getElementById(elemId), offset)
    }
  }

  render () {
    const contentHeaderClasses = classnames({
      [ style.contentHeader ]: true,
      [ style.contentHeaderSidebarClosed ]: true,
      'content-header': true
    })

    return (
      <div>
        <div className={contentHeaderClasses}>
          <h1>
            {this.props.date.format(TAPi18n.__('time.dateFormatWeekday'))}&nbsp;
            <small>{weekOfYear(this.props.date, { short: true })}</small>
          </h1>

          <div style={{ marginLeft: 30, marginRight: 15, flexGrow: 1 }}>
            <AppointmentsSearchContainer />
          </div>

          <div style={{ marginTop: 27 }}>
            <DateNavigation
              date={this.props.date}
              onTodayClick={this.scrollToCurrentTime}
              basePath="appointments"
              pullRight
              jumpWeekForward
              jumpMonthForward />
          </div>
        </div>

        <div className="content">
          <AppointmentsView
            assignees={this.props.assignees}
            date={this.props.date}
            onSetAdmitted={this.props.handleSetAdmitted}
            onMove={this.props.handleMove}
            onPopoverOpen={this.props.onPopoverOpen}
            onPopoverClose={this.props.onPopoverClose} />
        </div>

      </div>
    )
  }
}
