import React from 'react'
import { Link } from 'react-router-dom'
import { Calendars } from '../../api/calendars'

export const CalendarSelect = ({ basePath = 'appointments', canSeeCalendar = () => true }) => {
  const calendars = Calendars
    .find({}, { sort: { order: 1 } }).fetch()
    .filter(canSeeCalendar)
    .map(c => ({
      ...c,
      link: `/${basePath}/${c.slug}`
    }))

  return <div className='content'>
    <div className='row'>
      {calendars.map(c =>
        <CalendarItem key={c._id} {...c} />
      )}
    </div>
  </div>
}

const CalendarItem = ({ link, icon, color, name }) => (
  <div className='col-md-6 col-sm-12'>
    <Link to={link}>
      <div className='info-box'>
        <span className='info-box-icon' style={{ backgroundColor: color, color: '#fff' }}>
          <i className={`fa fa-${icon}`} />
        </span>
        <div className='info-box-content'>
          <span className='info-box-text'>Kalender</span>
          <span className='info-box-number'>{name}</span>
        </div>
      </div>
    </Link>
  </div>
)
