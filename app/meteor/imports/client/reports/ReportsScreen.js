import React from 'react'
import moment from 'moment-timezone'
import Button from 'react-bootstrap/lib/Button'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { DateNavigation } from '../components/DateNavigation'
import { PrintSettings } from './shared/PrintSettings'
import { FooterContainer } from '../layout/FooterContainer'
import { Loading } from '../components/Loading'
import { Statistics } from './statistics/Statistics'
import { PreviewBoxes } from './PreviewBoxes'
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
      previews,
      mapUserIdToName,
      mapUserIdToUsername,
      sendEmail,
      sendEmailTest,
      viewAppointments
    } = this.props

    const from = statistics && statistics.current && statistics.current.from
    const rangeLabel = from
      ? __('reports.windowRange', {
        from: moment(from).format('D. MMM'),
        to: date.format('D. MMM YYYY')
      })
      : ''

    return (
      <div>
        <PrintSettings orientation='landscape' />

        <div className='content-header'>
          <h1>
            {__('reports.statisticsTitle')}&nbsp;
            <small>{__('reports.windowLabel', { days: (statistics && statistics.windowDays) || 30 })} · {rangeLabel}</small>
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
            : <div className='content'>
              <Statistics statistics={statistics} />

              {
                previews &&
                  <div style={{ marginTop: 16 }}>
                    <h2>{__('reports.previewTitle')}</h2>
                    <PreviewBoxes
                      previews={previews}
                      mapUserIdToUsername={mapUserIdToUsername}
                      mapUserIdToName={mapUserIdToName} />
                  </div>
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
