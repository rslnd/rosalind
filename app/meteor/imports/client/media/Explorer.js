import React from 'react'
import { Media as MediaAPI } from '../../api/media'
import { __ } from '../../i18n'
import moment from 'moment-timezone'
import { Appointments } from '../../api'
import { withTracker } from '../components/withTracker'

const composer = ({ patient, currentAppointment }) => {
  const allMedia = MediaAPI.find({
    patientId: patient._id
  }, { sort: { createdAt: 1 } }).fetch()

  // group by months and add relevant appointment
  const { sections } = allMedia.reduce((acc, media) => {
    const m = moment(media.createdAt)
    const currentMonth = m.format(__('time.dateFormatMonthYearOnly'))
    const currentAppointmentId = media.appointmentId

    let sectionsToAdd = []

    if (currentMonth !== acc.currentMonth) {
      sectionsToAdd.push({
        monthSeparator: currentMonth,
        m
      })
    }

    if (currentAppointmentId !== acc.currentAppointmentId) {
      const appointment = Appointments.findOne({ currentAppointmentId })
      sectionsToAdd.push({ appointment })
    }

    return {
      currentMonth,
      currentAppointmentId,
      sections: [
        ...acc.sections,
        ...sectionsToAdd,
        { media }
      ]
    }
  }, { currentMonth: null, currentAppointmentId: null, sections: [] })

  return {
    sections
  }
}

export const Explorer = withTracker(composer)(({ sections }) =>
  <div>
    {
      sections.map(s =>
        (s.monthSeparator && <MonthSeparator key={s.monthSeparator} {...s} />) ||
        (s.appointment && <Appointment key={s.appointment._id} appointment={s.appointment} />) ||
        (s.media && <Media key={s.media.url} media={s.media} />)
      )
    }
  </div>
)

const MonthSeparator = ({ m }) =>
  <div><b>{m.format('MMMM')}</b> {m.format('YYYY')}</div>

const Appointment = ({ appointment: { start } }) =>
  <div>Appt {moment.format(start).format(__('time.dateFormatWeekdayShortNoYear'))}</div>

const Media = ({ media: { url } }) =>
  <div>Media {url}</div>
