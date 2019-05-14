import moment from 'moment-timezone'
import React from 'react'
import { Icon } from '../components/Icon'
import { __ } from '../../i18n'
import { twoPlacesIfNeeded } from '../../util/format'
import { withHandlers, compose, withState } from 'recompose'
import { Money } from './Field'
import { updateAppointment } from './updateAppointment'
import { Indicator } from '../appointments/appointment/Indicator'
import { Logs } from '../helpers/Logs'
import { Stamps } from '../helpers/Stamps'
import { logFormat } from '../appointments/info/logFormat'

export const Info = compose(
  withState('showLogs', 'setShowLogs', false),
  withHandlers({
    handleToggleLogs: props => e => props.setShowLogs(!props.showLogs)
  })
)(({ showLogs, handleToggleLogs, appointment, calendar, fullNameWithTitle, isCurrent }) =>
  <>
    <div style={isCurrent ? currentInfoStyle : infoStyle}>
      <span style={flexStyle} onClick={handleToggleLogs}>
        <span style={dateColumnStyle}>
          <Icon name={calendar && calendar.icon} style={calendarIconStyle} />
          &nbsp;
          <Date {...appointment} />
          &emsp;
          {appointment.removed && <Icon name='trash-o' title={__('ui.deleted')} />}
        </span>
        <span style={timeColumnStyle}>
          <Time {...appointment} />
        </span>
        <Assignee {...appointment} fullNameWithTitle={fullNameWithTitle} />
      </span>

      <span style={flexStyle}>
        <Revenue {...appointment} />
        <Indicator appointment={appointment} style={infoIconStyle} calendar={calendar} />
      </span>
    </div>
    {
      showLogs && <div
        onClick={handleToggleLogs}
        style={infoPaddingStyle}
      >
        <Logs format={logFormat} doc={appointment} />
        <Stamps
          collectionName='appointments'
          fields={['removed', 'created', 'admitted', 'canceled']}
          doc={appointment} />
      </div>
    }
  </>
)

const infoPaddingStyle = {
  padding: 12,
  paddingTop: 7,
  paddingBottom: 4,
  opacity: 0.9,
  width: '100%'
}

const infoStyle = {
  ...infoPaddingStyle,
  display: 'flex',
  justifyContent: 'space-between'
}

const currentInfoStyle = {
  ...infoStyle
}

// Fix icon alignmeht with text spans
const infoIconStyle = {
  marginTop: '2.5px'
}

const calendarIconStyle = {
  ...infoIconStyle,
  marginRight: 5,
  opacity: 0.7
}

const flexStyle = {
  display: 'flex'
}

export const dateColumnStyle = {
  display: 'flex',
  width: 180
}

export const timeColumnStyle = {
  width: 85
}

const Date = ({ start, canceled, removed }) =>
  <span style={(canceled || removed) ? canceledStyle : null}>
    {start && formatDate(start)}
  </span>

const canceledStyle = {
  opacity: 0.8,
  textDecoration: 'line-through'
}

const Time = ({ start, canceled, removed }) =>
  <span style={(canceled || removed) ? canceledStyle : null}>
    {start && <span style={timeStyle}>{formatTime(start)}</span>}
  </span>

const timeStyle = {
  opacity: 0.65
}

const formatDate = d => moment(d).format(__('time.dateFormatWeekdayShort'))
const formatTime = d => moment(d).format(__('time.timeFormat'))

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
  updateRevenue: props => revenue => updateAppointment(props, { revenue: revenue })
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
