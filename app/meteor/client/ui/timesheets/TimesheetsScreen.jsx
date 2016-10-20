import moment from 'moment'
import 'moment-duration-format'
import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { Button } from 'react-bootstrap'
import { Icon } from 'client/ui/components/Icon'
import { DateNavigation } from 'client/ui/components/DateNavigation'
import { Box } from 'client/ui/components/Box'

const Nil = () => (
  <span className="text-quite-muted">&ndash;</span>
)

const End = ({ end, isToday }) => (
  <span>
    {
      end
      ? end.format('H:mm')
      : (isToday
        ? TAPi18n.__('timesheets.now')
        : <Icon name="times-circle-o" />
      )
    }
  </span>
)

const Duration = ({ start, end, isToday, duration }) => (
  <span>
    {
      start && (end || isToday)
      ? moment.duration(duration).format('H[h] mm[m]')
      : '0h'
    }
  </span>
)

class TimesheetTableRow extends React.Component {
  render () {
    const { timesheet } = this.props
    const start = moment(timesheet.start)
    const end = timesheet.end ? moment(timesheet.end) : undefined
    const isToday = moment().isSame(start, 'day')
    const duration = moment(end).diff(start)
    return (
      <tr>
        <td>{start.format('ddd')}</td>
        <td style={{ textAlign: 'right' }}>
          {start.format('D')}.&nbsp;
          <span className="text-muted">{start.format('MMM YYYY')}</span>
        </td>

        <td style={{ textAlign: 'right' }}>{start.format('H:mm')}</td>
        <td className="text-muted">-</td>
        <td><End {...{ end, isToday }} /></td>

        <td style={{ textAlign: 'right' }}>
          {
            start && (end || isToday)
            ? moment.duration(duration).format('H[ Std] m[ Min]')
            : <Nil />
          }
        </td>
      </tr>
    )
  }
}


const TimesheetsTableHeader = () => (
  <thead>
    <tr>
      <th style={{ width: 10 }}>&nbsp;</th>
      <th style={{ width: 120, textAlign: 'right' }}>Datum</th>
      <th style={{ textAlign: 'right' }}>von</th>
      <th style={{ width: 5 }} className="text-muted">-</th>
      <th>bis</th>
      <th style={{ textAlign: 'right' }}>Gesamt</th>
    </tr>
  </thead>
)

const TimesheetsTableBody = ({ timesheets }) => (
  <tbody>
    {
      timesheets.map((timesheet) => (
        <TimesheetTableRow key={timesheet._id} timesheet={timesheet} />
      ))
    }
  </tbody>
)

export class TimesheetsScreen extends React.Component {
  constructor (props) {
    super(props)
    this.handlePrint = this.handlePrint.bind(this)
  }

  handlePrint () {
    if (window.native) {
      console.log('[Client] Printing: native')
      const title = moment(this.props.start)
        .format("YYYY-MM-DD-[#{TAPi18n.__('reports.thisDaySingular')}]")
      window.native.print({ title })
    } else {
      console.log('[Client] Printing: default')
      window.print()
    }
  }

  render () {
    const { timesheets, sum } = this.props
    return (
      <div>
        <div className="content-header">
          <h1>
            {TAPi18n.__('timesheets.this')}
          </h1>
          <DateNavigation date={this.props.start} basePath="schedules/timesheets" pullRight>
            <Button onClick={this.handlePrint} title={TAPi18n.__('ui.print')}><Icon name="print" /></Button>
            {
              this.props.canShowRevenue &&
                <Button onClick={this.handleToggleRevenue} title={TAPi18n.__('reports.showRevenue')}><Icon name="euro" /></Button>
            }
          </DateNavigation>
        </div>
        <div className="content">
          <Box>
            <div className="table-responsive">
              <table className="table no-margin">
                <TimesheetsTableHeader />
                <TimesheetsTableBody timesheets={timesheets} />
              </table>
            </div>
          </Box>
        </div>
      </div>
    )
  }
}
