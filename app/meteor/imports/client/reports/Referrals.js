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

const stages = ['referred', 'pending', 'redeemed']

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
                  <Cell style={headerTitleStyle} key={c._id} colSpan={3}>
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
                    <Referred key={`${c._id}-referred`} />,
                    <Pending key={`${c._id}-pending`} />,
                    <Redeemed key={`${c._id}-redeemed`} />
                  ]
                )
              }
              <Referred style={doubleSeparatorStyle} />
              <Pending />
              <Redeemed />
            </TableRow>
          </TableHead>
          <TableBody>
            {
              referrals.assignees.map(a =>
                <TableRow key={a.assigneeId}>
                  <Cell style={textCellStyle}>{mapUserIdToName(a.assigneeId)}</Cell>
                  {
                    columns.map(c =>
                      stages.map((stage, i) =>
                        <Cell
                          style={i === 0 ? separatorStyle : null}
                          key={`${c._id}-${a.assigneeId}-${stage}`}>
                          <Value
                            total={a[stage].ids[c._id]}
                            today={a[`${stage}Today`].ids[c._id]}
                          />
                        </Cell>
                      )
                    )
                  }
                  <Cell style={doubleSeparatorStyle}>
                    <Value
                      total={a.referred.total}
                      today={a.referredToday.total}
                    />
                  </Cell>
                  <Cell>
                    <Value
                      total={a.pending.total}
                      today={a.pendingToday.total}
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

            {/* Summary Row */}
            <TableRow style={summaryRowStyle}>
              <Cell />
              {
                columns.map(c =>
                  stages.map(stage =>
                    <Cell style={separatorStyle} key={`${c._id}-${stage}`}>
                      <Value
                        total={referrals.total[stage].ids[c._id]}
                        today={referrals.total[`${stage}Today`].ids[c._id]}
                      />
                    </Cell>
                  )
                )
              }

              {
                stages.map((stage, i) =>
                  <Cell style={i === 0 ? doubleSeparatorStyle : separatorStyle} key={stage}>
                    <Value
                      total={referrals.total[stage].total}
                      today={referrals.total[`${stage}Today`].total}
                    />
                  </Cell>
                )
              }
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </div>
  )
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
