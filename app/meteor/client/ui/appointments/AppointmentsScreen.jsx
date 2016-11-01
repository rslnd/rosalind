import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { weekOfYear } from 'util/time/format'
import { DateNavigation } from 'client/ui/components/DateNavigation'
import { AppointmentsView } from './AppointmentsView'
import { AppointmentsSearchContainer } from './AppointmentsSearchContainer'
import style from './style'

export class AppointmentsScreen extends React.Component {
  render () {
    return (
      <div>
        <div className={`content-header ${style.contentHeader}`}>
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
              basePath="appointments"
              pullRight />
          </div>
        </div>

        <div className="content">
          <AppointmentsView
            assignees={this.props.assignees}
            date={this.props.date}
            onPopoverOpen={this.props.onPopoverOpen}
            onPopoverClose={this.props.onPopoverClose} />
        </div>

      </div>
    )
  }
}
