import React from 'react'
import { __ } from '../../i18n'
import moment from 'moment-timezone'
import { Preview } from './Drawer'
import { TagsList } from '../tags/TagsList'

export const Explorer = ({ style, sections, setCurrentMediaId, currentMediaId }) =>
  <div style={style ? { ...explorerStyle, ...style } : explorerStyle}>
    {
      sections.map(s =>
        (s.monthSeparator && <MonthSeparator key={s.monthSeparator} {...s} />) ||
        (s.appointment && <Appointment key={s.appointment._id} appointment={s.appointment} />) ||
        (s.media && <Media
          key={s.media.url}
          media={s.media}
          handleMediaClick={setCurrentMediaId}
          isCurrent={s.media._id === currentMediaId}
        />)
      )
    }
  </div>

const MonthSeparator = ({ m }) =>
  <div style={monthSeparatorStyle}>
    <b>{m.format('MMMM')}</b> {m.format('YYYY')}
  </div>

const Appointment = ({ appointment: { start, tags } }) =>
  <div style={appointmentStyle}>
    <div style={appointmentDateStyle}>
      {moment(start).format(__('time.dateFormatWeekdayShortNoYear'))}
    </div>
    <div>
      <TagsList tags={tags} tiny />
    </div>
  </div>

const Media = ({ media, handleMediaClick, isCurrent }) =>
  <Preview
    media={media}
    handleMediaClick={handleMediaClick}
    style={mediaStyle}
    borderStyle={isCurrent ? mediaBorderSelectedStyle : mediaBorderStyle}
  />

const explorerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'start',
  alignContent: 'flex-start'
}

const separatorStyle = {
  width: '100%',
  paddingLeft: 10,
  paddingTop: 4,
  paddingBottom: 4
}

const monthSeparatorStyle = {
  ...separatorStyle
}

const appointmentStyle = {
  ...separatorStyle,
  paddingLeft: 13
}

const appointmentDateStyle = {
  color: 'rgba(220,220,220,0.9)',
  fontSize: '80%'
}

const mediaBorderStyle = {
  border: '4px solid rgba(255,255,255,0.1)'
}

const mediaBorderSelectedStyle = {
  border: '4px solid #fff'
}

const mediaStyle = {
  width: 96
}
