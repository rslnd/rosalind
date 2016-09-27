import React from 'react'
import { StickyContainer, Sticky } from 'react-sticky'
import { TAPi18n } from 'meteor/tap:i18n'
import { weekOfYear } from 'util/time/format'
import { DateNavigation } from 'client/ui/components/DateNavigation'
import { AppointmentsView } from './AppointmentsView'
import style from './style'

export class AppointmentsScreen extends React.Component {
  render () {
    return (
      <StickyContainer>
        <Sticky className={`content-header ${style.contentHeader}`}>
          <h1>
            {this.props.date.format(TAPi18n.__('time.dateFormatWeekday'))}&nbsp;
            <small>{weekOfYear(this.props.date)}</small>
          </h1>
          <DateNavigation date={this.props.date} basePath="appointments" pullRight />
        </Sticky>

        <div className="content">
          <AppointmentsView assignees={this.props.assignees} date={this.props.date} />
        </div>

      </StickyContainer>
    )
  }
}
