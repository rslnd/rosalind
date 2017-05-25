import React from 'react'
import FlipMove from 'react-flip-move'
import moment from 'moment-timezone'
import { Button } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'
import { weekOfYear } from 'util/time/format'
import { dayToDate } from 'util/time/day'
import { Icon } from 'client/ui/components/Icon'
import { DateNavigation } from 'client/ui/components/DateNavigation'
import { Box } from 'client/ui/components/Box'
import { Report } from './Report'

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
    if (window.native) {
      console.log('[Client] Printing: native')
      const title = moment(dayToDate(this.props.day))
        .format("YYYY-MM-DD-[#{TAPi18n.__('reports.thisDaySingular')}]")
      window.native.print({ title })
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
    return (
      <div>
        <div className="content-header show-print">
          <h1 className="show-print">
            {TAPi18n.__('reports.thisDaySingular')} {this.props.date.format(TAPi18n.__('time.dateFormatWeekday'))}&nbsp;
            <small>{weekOfYear(this.props.date, { short: true })}</small>
          </h1>
          <DateNavigation
            date={this.props.date}
            basePath="reports"
            pullRight
            jumpWeekBackward
            jumpMonthBackward
            jumpWeekForward
            jumpMonthForward>
            <Button onClick={this.handlePrint} title={TAPi18n.__('ui.print')}><Icon name="print" /></Button>
            {
              this.props.canShowRevenue &&
                <Button onClick={this.handleToggleRevenue} title={TAPi18n.__('reports.toggleRevenue')}><Icon name="euro" /></Button>
            }
          </DateNavigation>
        </div>
        <div className="content">
          <div className="display-none show-print" style={{ width: '100%', height: 5 }}></div>
          <FlipMove duration={230}>
            {
              this.props.report
              ? <div key="reportTable">
                  <Report report={this.props.report} showRevenue={this.state.showRevenue} />
                </div>
              : <div key="noReports">
                  <Box type="warning" title={TAPi18n.__('ui.notice')}>
                    <p>{TAPi18n.__('reports.empty')}</p>
                  </Box>
                </div>
            }
          </FlipMove>

          <div className="hide-print">
            <Button onClick={this.props.generateReport}>
                Diesen Bericht neu generieren
            </Button>

            <Button onClick={this.props.viewAppointments}>
                Terminkalender für diesen Tag ansehen
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
