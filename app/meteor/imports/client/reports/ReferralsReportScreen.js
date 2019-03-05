import React from 'react'
import moment from 'moment-timezone'
import Button from 'react-bootstrap/lib/Button'
import { __ } from '../../i18n'
import { dayToDate } from '../../util/time/day'
import { Icon } from '../components/Icon'
import { Loading } from '../components/Loading'
import { PrintSettings } from './shared/PrintSettings'
import { DateRangeNavigation } from '../components/DateRangeNavigation'
import { Box } from '../components/Box'
import { ReferralsDetailTable } from './ReferralsDetailTable'
import { UserPicker } from '../users/UserPicker'
import { fullNameWithTitle } from '../../api/users/methods/name'
import { toNative, getClientKey } from '../../startup/client/native/events'

const formatRange = ({ start, end }) =>
  ([
    moment(start).format(__('time.dateFormatShortNoYear')),
    '-',
    moment(end).format(__('time.dateFormatShort'))
  ].join(' '))

export class ReferralsReportScreen extends React.Component {
  constructor (props) {
    super(props)
    this.handlePrint = this.handlePrint.bind(this)
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

  render () {
    const {
      isLoading,
      from,
      to,
      user,
      referrals,
      handleRangeChange,
      handleChangeAssignee,
      mapUserIdToName
    } = this.props

    const formattedRange = formatRange({
      start: from,
      end: to
    })

    const title = (user &&
      __('reports.referralsReportFor', {
        name: fullNameWithTitle(user)
      })) || __('reports.referralsReport')

    return (
      <div>
        <PrintSettings orientation='portrait' />

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
              : isLoading
                ? <Loading />
                : (referrals && referrals.length > 0)
                  ? <ReferralsDetailTable
                    referrals={referrals}
                    mapUserIdToName={mapUserIdToName}
                  />
                  : <div key='noReports'>
                    <Box type='info' title={__('ui.notice')}>
                      <p>{__('reports.emptyAssignee')}</p>
                    </Box>
                  </div>
          }
        </div>
      </div>
    )
  }
}
