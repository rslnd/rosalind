import React from 'react'
import moment from 'moment-timezone'
import { Button } from '../components/bootstrap'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { DateNavigation } from '../components/DateNavigation'
import { PrintSettings } from './shared/PrintSettings'
import { FooterContainer } from '../layout/FooterContainer'
import { Loading } from '../components/Loading'
import { Statistics } from './statistics/Statistics'
import { Forecast } from './statistics/Forecast'
import { getClientKey, toNative } from '../../startup/client/native/events'

export class ReportsScreen extends React.Component {
  constructor (props) {
    super(props)
    this.handlePrint = this.handlePrint.bind(this)
  }

  handlePrint () {
    if (getClientKey()) {
      const title = this.props.date
        .format(`YYYY-MM-DD-[${__('reports.statisticsTitle')}]`)
      toNative('print', { title })
    } else {
      window.print()
    }
  }

  render () {
    const {
      date,
      statistics,
      sendEmail,
      sendEmailTest,
      viewAppointments
    } = this.props

    // Today and future days are a forecast (planned capacity vs. bookings), not a
    // retrospective 30-day window.
    const isForecast = date.isSameOrAfter(moment(), 'day')

    return (
      <div>
        <PrintSettings orientation='landscape' />

        <div className='content-header'>
          <h1>
            {__('reports.statisticsTitle')}
            {isForecast && <span>&nbsp;<small>{__('reports.forecastTitle')}</small></span>}
          </h1>
          <DateNavigation
            date={date}
            basePath='reports/day'
            pullRight
            jumpWeekBackward
            jumpMonthBackward
            jumpWeekForward
            jumpMonthForward>
            <Button onClick={this.handlePrint} title={__('ui.print')}><Icon name='print' /></Button>
          </DateNavigation>
        </div>

        {
          !statistics
            ? <Loading />
            : <div className='content enable-select'>
              {
                isForecast
                  ? <Forecast forecast={statistics.forecast} date={date} />
                  : <Statistics statistics={statistics} />
              }

              <FooterContainer />

              <div className='hide-print'>
                <Button onClick={viewAppointments}>
                  {__('appointments.this')}
                </Button>
                <Button onClick={sendEmailTest}>
                  {__('reports.statisticsTitle')} – Test-E-Mail
                </Button>
                <Button onClick={sendEmail}>
                  {__('reports.statisticsTitle')} – E-Mail senden
                </Button>
              </div>
            </div>
        }
      </div>
    )
  }
}
