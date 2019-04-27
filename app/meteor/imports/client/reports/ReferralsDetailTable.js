import React from 'react'
import { namecase } from '../../util/namecase'
import sortBy from 'lodash/fp/sortBy'
import { __ } from '../../i18n'
import moment from 'moment'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  numberCellStyle,
  separatorStyle,
  summaryRowStyle
} from '../components/Table'
import { Box } from '../components/Box'
import { ReferralsDetailSummary } from './ReferralsDetailSummary'
import { Nil } from './shared/Nil'
import { Referrables } from '../../api'

export const ReferralsDetailTable = ({ referrals, mapUserIdToName }) => {
  const rows = sortBy('createdAt')(
    referrals.map(r => ({
      ...r,
      referrable: Referrables.findOne({ _id: r.referrableId })
    })))

  return (
    <div>
      <ReferralsDetailSummary referrals={rows} />
      <Box noPadding>
        <Table>
          <TableHead>
            <TableRow>
              <Cell />
              <Cell>{__('patients.thisOne')}</Cell>
              <Cell />
              <Cell style={separatorStyle}>{__('reports.referralReferred')}</Cell>
              <Cell style={separatorStyle}>{__('reports.referralPending')}</Cell>
              <Cell style={separatorStyle}>{__('reports.referralRedeemed')}</Cell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              rows.map((r, i) =>
                <TableRow key={r._id}>
                  <Cell style={{ ...numberCellStyle, width: 24 }}><span className='text-muted'>{i + 1}</span></Cell>
                  <Cell><b>{namecase(r.patient.lastName)}</b> {namecase(r.patient.firstName)}</Cell>
                  <Cell>{r.referrable.name}</Cell>

                  <Cell style={{ ...separatorStyle, width: '20%' }}>
                    <Date date={r.createdAt} />
                  </Cell>
                  <Cell style={{ ...separatorStyle, width: '20%' }}>
                    <Date date={r.pendingAt} relativeTo={r.createdAt} />
                  </Cell>
                  <Cell style={{ ...separatorStyle, width: '20%' }}>
                    {
                      r.redeemedAt
                        ? <Date date={r.redeemedAt} relativeTo={r.pendingAt} />
                        : r.pendingAt && !r.redeemedAt
                          ? <span className='text-muted'>
                            {__('reports.referralExpectedAt')} <Date date={r.plannedRedeemedAt} />
                          </span>
                          : <Nil />
                    }
                  </Cell>
                </TableRow>
              )
            }

            <TableRow style={summaryRowStyle}>
              <Cell />
              <Cell>Summe</Cell>
              <Cell />
              <Cell style={separatorStyle}>
                <b>{referrals.length}</b> {__('reports.referralReferred')}
              </Cell>
              <Cell style={separatorStyle}>
                <b>{referrals.filter(r => r.pendingAt).length}</b> {__('reports.referralPending')}
              </Cell>
              <Cell style={separatorStyle}>
                <b>{referrals.filter(r => r.redeemedAt).length}</b> {__('reports.referralRedeemed')}
              </Cell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </div>
  )
}

const Date = ({ date, relativeTo }) => {
  if (!date) { return <Nil /> }

  const absolute = moment(date).format(__('time.dateFormatShortNoYear'))

  if (relativeTo) {
    const relative = moment.range(
      moment(relativeTo).clone().startOf('day'),
      moment(date).clone().startOf('day')
    ).diff('days')
    return <span>
      {absolute} <span className='text-muted'>(+{relative}d)</span>
    </span>
  } else {
    return absolute
  }
}

const Cell = ({ children, ...props }) =>
  <TableCell padding='dense' {...props}>
    {children}
  </TableCell>
