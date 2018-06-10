import React from 'react'
import namecase from 'namecase'
import uniq from 'lodash/uniq'
import sortBy from 'lodash/fp/sortBy'
import { TAPi18n } from 'meteor/tap:i18n'
import moment from 'moment'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  numberCellStyle,
  textCellStyle,
  iconCellStyle,
  separatorStyle,
  doubleSeparatorStyle,
  headerTitleStyle,
  doubleSeparatorHeaderTitleStyle,
  summaryRowStyle } from './shared/Table'
import { Calendars } from '../../api/calendars'
import { Tags } from '../../api/tags'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { PatientName } from '../patients/PatientName'
import { ReferralsDetailSummary } from './ReferralsDetailSummary'

const stages = ['referred', 'pending', 'redeemed']

const referredToTitle = _id => {
  const tag = Tags.findOne({ _id })
  if (tag) {
    return tag.tag
  }
  const calendar = Calendars.findOne({ _id })
  if (calendar) {
    return calendar.name
  }

  console.error('[Referrals] Cannot find calendar or tag with id', _id)
}

export const ReferralsDetailTable = ({ referrals, mapUserIdToName }) => {
  const rows = sortBy('createdAt')(
    referrals.map(r => ({
      ...r,
      referredToTitle: referredToTitle(r.referredTo)
    })))

  return (
    <div>
      <ReferralsDetailSummary referrals={rows} />
      <Box noPadding>
        <Table>
          <TableHead>
            <TableRow>
              <Cell />
              <Cell>{TAPi18n.__('patients.thisOne')}</Cell>
              <Cell />
              <Cell style={separatorStyle}>{TAPi18n.__('reports.referralReferred')}</Cell>
              <Cell style={separatorStyle}>{TAPi18n.__('reports.referralPending')}</Cell>
              <Cell style={separatorStyle}>{TAPi18n.__('reports.referralRedeemed')}</Cell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              rows.map((r, i) =>
                <TableRow key={r._id}>
                  <Cell style={{...numberCellStyle, width: 24}}><span className='text-muted'>{i+1}</span></Cell>
                  <Cell><b>{namecase(r.patient.lastName)}</b> {namecase(r.patient.firstName)}</Cell>
                  <Cell>{r.referredToTitle}</Cell>

                  <Cell style={{...separatorStyle, width: '20%'}}>
                    <Date date={r.createdAt} />
                  </Cell>
                  <Cell style={{...separatorStyle, width: '20%'}}>
                    <Date date={r.pendingAt} relativeTo={r.createdAt} />
                  </Cell>
                  <Cell style={{...separatorStyle, width: '20%'}}>
                    <Date date={r.redeemedAt} relativeTo={r.pendingAt} />
                  </Cell>
                </TableRow>
              )
            }

            <TableRow style={summaryRowStyle}>
              <Cell />
              <Cell>Summe</Cell>
              <Cell />
              <Cell style={separatorStyle}>
                <b>{referrals.length}</b> {TAPi18n.__('reports.referralReferred')}
              </Cell>
              <Cell style={separatorStyle}>
                <b>{referrals.filter(r => r.pendingAt).length}</b> {TAPi18n.__('reports.referralPending')}
              </Cell>
              <Cell style={separatorStyle}>
                <b>{referrals.filter(r => r.redeemedAt).length}</b> {TAPi18n.__('reports.referralRedeemed')}
              </Cell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </div>
  )
}

const Date = ({ date, relativeTo }) => {
  if (!date) { return '-' }

  const absolute = moment(date).format(TAPi18n.__('time.dateFormatShortNoYear'))

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

const Referred = ({ style }) =>
  <Cell
    style={style || separatorStyle}
    title='Ausgesprochene Empfehlungen'>
    <Icon name='commenting-o' />
  </Cell>

const Pending = () =>
  <Cell
    style={separatorStyle}
    title='Aufgrund von Empfehlungen geplante Termine'>
    <Icon name='clock-o' />
  </Cell>

const Redeemed = () =>
  <Cell
    style={separatorStyle}
    title='Von PatientIn in Anspruch genommene Empfehlungen'>
    <Icon name='check' />
  </Cell>

const Cell = ({ children, ...props }) =>
  <TableCell padding='dense' {...props}>
    {children}
  </TableCell>

const Value = ({ total, today }) =>
  <span>
    {total && total > 0 ? total : null}
    {
      today && today > 0
        ? <span className='text-muted'>
          &nbsp;
          (+{today})
        </span> : null
    }
  </span>
