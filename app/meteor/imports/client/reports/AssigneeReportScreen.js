import React from 'react'
import moment from 'moment-timezone'
import Button from 'react-bootstrap/lib/Button'
import { __ } from '../../i18n'
import { dayToDate } from '../../util/time/day'
import { Icon } from '../components/Icon'
import { Loading } from '../components/Loading'
import { DateRangeNavigation } from '../components/DateRangeNavigation'
import { Box } from '../components/Box'
import { Report } from './Report'
import { Referrals } from './Referrals'
import { PrintSettings } from './shared/PrintSettings'
import { UserPicker } from '../users/UserPicker'
import { fullNameWithTitle } from '../../api/users/methods/name'
import { getClientKey, toNative } from '../../startup/client/native/events'

const formatRange = ({ start, end }) =>
  ([
    moment(start).format(__('time.dateFormatShortNoYear')),
    '-',
    moment(end).format(__('time.dateFormatShort'))
  ].join(' '))

export class AssigneeReportScreen extends React.Component {
  constructor (props) {
    super(props)
    this.handlePrint = this.handlePrint.bind(this)
    this.handleToggleRevenue = this.handleToggleRevenue.bind(this)

    this.state = {
      showRevenue: false
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
      from,
      to,
      user,
      referrals,
      handleRangeChange,
      canShowRevenue,
      handleChangeAssignee,
      reports,
      mapUserIdToName,
      mapReportAsToHeader
    } = this.props

    const formattedRange = formatRange({
      start: from,
      end: to
    })

    const title = (user &&
      __('reports.assigneesReportFor', {
        name: fullNameWithTitle(user)
      })) || __('reports.assigneesReport')

    return (
      <div>
        <PrintSettings orientation='landscape' />

        <div className='content-header show-print'>
          <h1 className='show-print'>
            {title}
            <small className='hide-screen'>{formattedRange}</small>
          </h1>

          <DateRangeNavigation
            start={from}
            end={to}
            onRangeChange={handleRangeChange}
            calendarText={formattedRange}
            pullRight>
            <Button onClick={this.handlePrint} title={__('ui.print')}><Icon name='print' /></Button>
            {
              canShowRevenue &&
                <Button onClick={this.handleToggleRevenue} title={__('reports.toggleRevenue')}><Icon name='euro' /></Button>
            }
          </DateRangeNavigation>
        </div>
        <div className='content'>
          <div className='hide-print' style={{ paddingBottom: 15 }}>
            <UserPicker
              autoFocus
              onChange={handleChangeAssignee} />
          </div>
          <div className='display-none show-print' style={{ width: '100%', height: 5 }} />
          {
            !user
              ? <Box type='info' title={__('ui.notice')}>
                <p>{__('reports.emptySelectAssignee')}</p>
              </Box>
              : loading
                ? <Loading />
                : ((reports && reports.length > 0) && reports.map((report, i) =>
                  <div key={i} style={{ marginBottom: 80 }}>
                    <Report
                      report={report}
                      showRevenue={this.state.showRevenue}
                      mapUserIdToName={mapUserIdToName}
                      mapReportAsToHeader={mapReportAsToHeader}
                      assigneeReport
                    />
                  </div>
                )) || <div key='noReports'>
                  <Box type='info' title={__('ui.notice')}>
                    <p>{__('reports.emptyAssignee')}</p>
                  </Box>
                </div>
          }
          {
            user && referrals && referrals.assignees[0] &&
              <div>
                <Referrals
                  referrals={referrals}
                  mapUserIdToName={mapUserIdToName} />
                <span className='referralsLoaded' />
              </div>
          }
        </div>
      </div>
    )
  }
}
