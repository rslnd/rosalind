import React from 'react'
import moment from 'moment-timezone'
import Button from 'react-bootstrap/lib/Button'
import { __ } from '../../i18n'
import { weekOfYear } from '../../util/time/format'
import { dayToDate } from '../../util/time/day'
import { Icon } from '../components/Icon'
import { DateNavigation } from '../components/DateNavigation'
import { Box } from '../components/Box'
import { Report } from './Report'
import { PreviewBoxes } from './PreviewBoxes'
import { Quarter } from './Quarter'
import { Referrals } from './Referrals'
import { PrintSettings } from './shared/PrintSettings'
import { FooterContainer } from '../layout/FooterContainer'
import { Loading } from '../components/Loading'
import { getClientKey, toNative } from '../../startup/client/native/events'

const avoidPageBreak = {
  pageBreakInside: 'avoid'
}

export class ReportsScreen extends React.Component {
  constructor (props) {
    super(props)
    this.handlePrint = this.handlePrint.bind(this)
    this.handleToggleRevenue = this.handleToggleRevenue.bind(this)

    this.state = {
      showRevenue: props.canShowRevenue || false
    }
  }

  handlePrint () {
    if (getClientKey()) {
      console.log('[Client] Printing: native')
      const title = moment(dayToDate(this.props.day))
        .format(`YYYY-MM-DD-[${__('reports.thisDaySingular')}]`)
      toNative('print', { title })
    } else {
      console.log('[Client] Printing: default')
      window.print()
    }
  }

  handleToggleRevenue () {
    this.setState({
      ...this.state,
      showRevenue: !this.state.showRevenue
    })
  }

  render () {
    const {
      loading,
      reportLoading,
      date,
      reports,
      quarter,
      previews,
      referrals,
      canShowRevenue,
      mapUserIdToName,
      mapUserIdToUsername,
      mapReportAsToHeader,
      generateReport,
      removeReports,
      viewAppointments,
      sendEmailTest,
      sendEmail
    } = this.props

    return (
      <div>
        <PrintSettings orientation='landscape' />

        <div className='content-header show-print'>
          <h1 className='show-print'>
            {__('reports.thisDaySingular')} {date.format(__('time.dateFormatWeekday'))}&nbsp;
            <small>{weekOfYear(date, { short: true })}</small>
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
            {
              canShowRevenue &&
                <Button onClick={this.handleToggleRevenue} title={__('reports.toggleRevenue')}><Icon name='euro' /></Button>
            }
          </DateNavigation>
        </div>
        {
          reportLoading
            ? <Loading />
            : <div className='content'>
              <div className='display-none show-print' style={{ width: '100%', height: 5 }} />
              {
                (reports && reports.length >= 1)
                  ? reports.map(report =>
                    <div key={report._id}>
                      <Report
                        report={report}
                        showRevenue={this.state.showRevenue}
                        mapUserIdToName={mapUserIdToName}
                        mapReportAsToHeader={mapReportAsToHeader}
                      >
                        {
                          quarter && this.state.showRevenue &&
                          <div key='quarterTable' style={avoidPageBreak}>
                            <Quarter
                              calendar={report.calendar}
                              quarter={quarter.calendars.find(q => q.calendarId === report.calendar._id)}
                            />
                            <span className='quarterLoaded' />
                          </div>
                        }
                      </Report>
                      <FooterContainer />
                    </div>
                  ) : <div key='noReports'>
                    <Box type='warning' title={__('ui.notice')}>
                      <p>{__('reports.empty')}</p>
                    </Box>
                  </div>
              }

              { loading && <Loading />}

              {
                previews &&
                <div>
                  <PreviewBoxes
                    previews={previews}
                    mapUserIdToUsername={mapUserIdToUsername}
                    mapUserIdToName={mapUserIdToName} />
                </div>
              }

              {
                referrals &&
                <div>
                  <Referrals
                    referrals={referrals}
                    mapUserIdToName={mapUserIdToName} />
                </div>
              }

              <div className='hide-print'>
                <Button onClick={generateReport}>
                  Diesen Bericht neu generieren
                </Button>

                <Button onClick={viewAppointments}>
                  Terminkalender für diesen Tag ansehen
                </Button>

                <Button onClick={removeReports}>
                  Bericht Löschen
                </Button>


                <Button onClick={sendEmailTest}>
                  Test Email senden
                </Button>

                <Button onClick={sendEmail}>
                  Email senden
                </Button>
              </div>
            </div>
        }
      </div>
    )
  }
}
