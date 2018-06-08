import React from 'react'
import uniq from 'lodash/uniq'
import sortBy from 'lodash/fp/sortBy'
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
import { __ } from '../../i18n'

export const Referrals = ({ referrals, mapUserIdToName }) => {
  const hasData = referrals.total.referred.total || referrals.total.redeemed.total
  if (!hasData) { return null }

  const columns = sortBy('title')(uniq([
    ...Object.keys(referrals.total.referred.ids),
    ...Object.keys(referrals.total.redeemed.ids)])
    .map(_id => {
      const tag = Tags.findOne({ _id })
      if (tag) {
        return {
          _id,
          title: tag.tag
        }
      }
      const calendar = Calendars.findOne({ _id })
      if (calendar) {
        return {
          _id,
          title: calendar.name
        }
      }

      console.error('[Referrals] Cannot find calendar or tag with id', _id)
      return {}
    }))

  return (
    <div style={avoidPageBreak}>
      <Box noPadding>
        <Table>
          <TableHead>
            <TableRow>
              <Cell style={textCellStyle}>
                <b style={{ fontSize: '18px' }}>
                  <Icon name='angle-right' />
                  &nbsp;
                  Empfehlungen
                </b>
              </Cell>
              {
                columns.map(c =>
                  <Cell key={c._id} colSpan={2}>
                    {c.title}
                  </Cell>
                )
              }
              <Cell
                style={doubleSeparatorHeaderTitleStyle}
                colSpan={3}>
                Gesamt
              </Cell>
            </TableRow>
            <TableRow>
              <Cell>{/* Name */}</Cell>
              {
                columns.map(c =>
                  [
                    <Cell key={`${c._id}-referred`}>
                      <Referred />
                    </Cell>,
                    <Cell key={`${c._id}-redeemed`}>
                      <Redeemed />
                    </Cell>
                  ]
                )
              }
              <Cell style={separatorStyle}>
                <Referred />
              </Cell>
              <Cell>
                <Redeemed />
              </Cell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              referrals.assignees.map(a =>
                <TableRow key={a.assigneeId}>
                  <Cell style={textCellStyle}>{mapUserIdToName(a.assigneeId)}</Cell>
                  {
                    columns.map(c =>
                      [
                        <Cell key={`${c._id}-${a.assigneeId}-referred`}>
                          <Value
                            total={a.referred.ids[c._id]}
                            today={a.referredToday.ids[c._id]}
                          />
                        </Cell>,
                        <Cell key={`${c._id}-${a.assigneeId}-redeemed`}>
                          <Value
                            total={a.redeemed.ids[c._id]}
                            today={a.redeemedToday.ids[c._id]}
                          />
                        </Cell>
                      ]
                    )
                  }
                  <Cell style={separatorStyle}>
                    <Value
                      total={a.referred.total}
                      today={a.referredToday.total}
                    />
                  </Cell>
                  <Cell>
                    <Value
                      total={a.redeemed.total}
                      today={a.redeemedToday.total}
                    />
                  </Cell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </Box>
    </div>
  )
}

const separatorStyle = {
  borderLeft: '1px solid #ccc'
}

const doubleSeparatorStyle = {
  borderLeft: '3px double #ccc'
}

const headerTitleStyle = {
  ...separatorStyle,
  textAlign: 'center'
}

const doubleSeparatorHeaderTitleStyle = {
  ...headerTitleStyle,
  ...doubleSeparatorStyle
}

const summaryRowStyle = {
  borderTop: doubleSeparatorStyle.borderLeft
}

const Referred = ({ style }) =>
  <Cell
    style={style ? {...style, ...separatorStyle, ...iconCellStyle} : {...separatorStyle, ...iconCellStyle}}
    title={__('reports.referralReferredTitle')}>
    <Icon name='commenting-o' />
  </Cell>

const Pending = () =>
  <Cell
    style={{...separatorStyle, ...iconCellStyle}}
    title={__('reports.referralPendingTitle')}>
    <Icon name='clock-o' />
  </Cell>

const Redeemed = () =>
  <Cell
    style={{...separatorStyle, ...iconCellStyle}}
    title={__('reports.referralRedeemedTitle')}>
    <Icon name='check' />
  </Cell>

const Cell = ({ children, style, ...props }) =>
  <TableCell padding='dense' style={style ? {...numberCellStyle, ...style} : numberCellStyle} {...props}>
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

const avoidPageBreak = {
  pageBreakInside: 'avoid'
}
