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
        &emsp;
        {appointment.removed && <Icon name='trash-o' title={__('ui.deleted')} />}
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

const Date = ({ start, canceled, removed }) =>
  <span style={(canceled || removed) ? canceledStyle : null}>{start && formatDate(start)}</span>

const canceledStyle = {
  opacity: 0.8,
  textDecoration: 'line-through'
}

const formatDate = d => moment(d).format(__('time.dateFormatWeekdayShort'))

const Assignee = ({ assigneeId, waitlistAssigneeId, fullNameWithTitle, canceled, removed }) =>
  <span style={(canceled || removed) ? canceledStyle : null}>
    {fullNameWithTitle(assigneeId || waitlistAssigneeId)}
    {waitlistAssigneeId && <>
      &emsp;
      <Icon name='share' title='Einschub' style={reassignedStyle} />
    </>}
  </span>

const reassignedStyle = {
  zoom: 0.8,
  opacity: 0.6
}

const Revenue = withHandlers({
  updateRevenue: props => revenue => updateAppointment(props, { revenue: parseFloat(revenue) })
})(({ revenue, updateRevenue }) =>
  <Money
    initialValue={(revenue > 0 || revenue === 0) ? twoPlacesIfNeeded(revenue || 0) : ''}
    onChange={updateRevenue}
    placeholder={<span style={placeholderStyle}>€__</span>}
    style={revenueStyle}
  />
)

const revenueStyle = {
  paddingRight: 14,
  fontWeight: 600,
  textAlign: 'right',
  width: 80
}

const placeholderStyle = {
  opacity: 0.4,
  fontSize: '90%'
}
