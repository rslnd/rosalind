import moment from 'moment-timezone'
import React from 'react'
import { Icon } from '../components/Icon'
import { Tooltip } from '../components/Tooltip'
import { __ } from '../../i18n'
import { twoPlacesIfNeeded } from '../../util/format'
import { withHandlers } from 'recompose'
import { Money, Field } from './Field'
import { updateAppointment } from './updateAppointment'
import { Indicator } from '../appointments/appointment/Indicator'

export const Info = ({ appointment, calendar, fullNameWithTitle }) =>
  <div style={infoStyle}>
    <span style={flexStyle}>
      <span style={dateColumnStyle}>
        <Icon name={calendar && calendar.icon} style={calendarIconStyle} />
        &nbsp;
        <Date {...appointment} />
      </span>
      <Assignee {...appointment} fullNameWithTitle={fullNameWithTitle} />
    </span>

    <span style={flexStyle}>
      <Revenue {...appointment} />
      <Indicator appointment={appointment} style={infoIconStyle} calendar={calendar} />
    </span>
  </div>

const infoStyle = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  padding: 12,
  paddingTop: 9,
  opacity: 0.9
}

// Fix icon alignmeht with text spans
const infoIconStyle = {
  marginTop: '2.5px'
}

const calendarIconStyle = {
  ...infoIconStyle,
  marginRight: 5
}

const flexStyle = {
  display: 'flex'
}

export const dateColumnStyle = {
  display: 'flex',
  width: 240
}

const Date = ({ start }) =>
  <Tooltip title={'Donnerstag, 30. Jänner 2019 um 18:33 Uhr'}>
    <span>{formatDate(start)}</span>
  </Tooltip>

const formatDate = d => moment(d).format(__('time.dateFormatWeekdayShort'))

const Assignee = ({ assigneeId, fullNameWithTitle }) =>
  <span>{fullNameWithTitle(assigneeId)}</span>

const Revenue = withHandlers({
  updateRevenue: props => revenue => updateAppointment(props, { revenue: parseFloat(revenue) })
})(({ revenue, updateRevenue }) =>
  <Money
    initialValue={twoPlacesIfNeeded(revenue || 0)}
    onChange={updateRevenue}
    placeholder={<span style={revenueUnitStyle}>€&nbsp;</span>}
    style={revenueStyle}
  />
  // (true || revenue > 0 || revenue === 0) &&
)

const revenueStyle = {
  paddingRight: 14,
  fontWeight: 600,
  textAlign: 'right',
  width: 80
}

const revenueUnitStyle = {
  opacity: 0.8,
  fontSize: '90%'
}
