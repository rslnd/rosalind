import React from 'react'
import moment from 'moment-timezone'
import { Button } from '../components/bootstrap'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { DateNavigation } from '../components/DateNavigation'
import { PrintSettings } from './shared/PrintSettings'
import { Loading } from '../components/Loading'
import { Statistics } from './statistics/Statistics'
import { Forecast } from './statistics/Forecast'
import { getClientKey, toNative } from '../../startup/client/native/events'

export class ReportsScreen extends React.Component {
  constructor (props) {
    super(props)
    this.handlePrint = this.handlePrint.bind(this)
  }

  // The browser prints document.title in the page header, so name the report
  // there while it is open (and restore the practice name afterwards).
  componentDidMount () {
    this.originalTitle = document.title
    this.updateTitle()
  }

  componentDidUpdate () {
    this.updateTitle()
  }

  componentWillUnmount () {
    document.title = this.originalTitle
  }

  updateTitle () {
    const title = [
      __('reports.statisticsTitle'),
      this.props.date.format('D. MMMM YYYY'),
      '–',
      this.originalTitle
    ].join(' ')
    if (document.title !== title) { document.title = title }
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
      viewAppointments,
      calendars = []
    } = this.props

    // Future days are a forecast (planned capacity vs. bookings), past days a
    // retrospective report of that single day. Today stays a forecast until the
    // last patient is processed (or the hard end of the day), see dayFinished.js.
    const isFuture = date.isAfter(moment(), 'day')
    const isToday = date.isSame(moment(), 'day')
    const isForecast = isFuture || (isToday && !(statistics && statistics.dayFinished))

    return (
      <div>
        <PrintSettings orientation='landscape' />

        <div className='content-header'>
          <h1 className='enable-select'>
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
            {calendars.map(c => (
              <Button
                key={c._id}
                onClick={() => viewAppointments(c.slug)}
                title={`${__('reports.openDayView')} ${c.name}`}>
                <Icon name={c.icon || 'calendar'} />
                {calendars.length > 1 && <>&nbsp;{c.name}</>}
              </Button>
            ))}
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

              <div className='hide-print'>
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
