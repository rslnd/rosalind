import React from 'react'
import { __ } from '../../i18n'
import moment from 'moment-timezone'

export const Explorer = ({ style, sections }) =>
  <div style={style}>
    {
      sections.map(s =>
        (s.monthSeparator && <MonthSeparator key={s.monthSeparator} {...s} />) ||
        (s.appointment && <Appointment key={s.appointment._id} appointment={s.appointment} />) ||
        (s.media && <Media key={s.media.url} media={s.media} />)
      )
    }
  </div>

const MonthSeparator = ({ m }) =>
  <div><b>{m.format('MMMM')}</b> {m.format('YYYY')}</div>

const Appointment = ({ appointment: { start } }) =>
  <div>Appt {moment(start).format(__('time.dateFormatWeekdayShortNoYear'))}</div>

const Media = ({ media: { url, _id } }) =>
  <div>Media {_id}</div>
