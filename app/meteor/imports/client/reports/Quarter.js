import React from 'react'
import { Round } from './shared/Round'
import { integer } from '../../util/format'

export const Quarter = ({ quarter, calendar }) => (
  <div className='enable-select' style={boxStyle}>
    <div style={containerStyle}>
      <div style={titleContainer}>
        <div className='text-muted' style={titleStyle}>
          Q{quarter.q} {quarter.day.year}
        </div>
      </div>

      {!calendar.privateAppointments && <DayCounter quarter={quarter} />}
      {!calendar.privateAppointments && <NewPerHour quarter={quarter} />}
      <NoShows quarter={quarter} />
      <RevenuePerDay quarter={quarter} />
      <Accumulated quarter={quarter} />
      <Projected quarter={quarter} />
    </div>
  </div>
)

const boxStyle = {
  borderTop: '1px solid #ebf1f2',
  backgroundColor: 'rgb(251, 251, 251)'
}

const titleContainer = {
  flexShrink: 1,
  width: 10
}

const titleStyle = {
  color: '#ccc',
  padding: 5,
  transform: 'rotate(-90deg) translate(-20px, -10px)',
  width: 60
}

const containerStyle = {
  display: 'flex'
}

const statStyle = {
  flex: 1
}

const DayCounter = ({ quarter }) =>
  <Stat name='Tag'>
    {quarter.days.passed}
    <span className='text-muted'>/</span>
    {quarter.days.available}
  </Stat>

const NewPerHour = ({ quarter }) =>
  <Stat name='Neu pro Stunde'>
    <PerHour average value={quarter.patients.newPerHour.average} />
  </Stat>

const NoShows = ({ quarter }) =>
  <Stat name='Nicht Erschienen'>
    <Percentage average value={quarter.patients.noShow.average} />
  </Stat>

const RevenuePerDay = ({ quarter }) =>
  <Stat name='Tagesumsatz'>
    <Currency average value={quarter.revenue.averagePerDay} />
  </Stat>

const Accumulated = ({ quarter }) =>
  <Stat name='Kumuliert'>
    <Currency value={quarter.revenue.accumulated} />
  </Stat>

const Projected = ({ quarter }) =>
  <Stat name='Prognostiziert'>
    <Currency value={quarter.revenue.projected} />
  </Stat>

const PerHour = ({ value, average }) =>
  <span>
    {average && <small className='text-muted'>⌀&nbsp;</small>}
    <Round number={value} />
    <small className='text-muted'>&nbsp;/h</small>
  </span>

const Currency = ({ value, average }) =>
  <span>
    <small className='text-muted'>€&nbsp;</small>
    {integer(value)}
    {average && <small className='text-muted'>&nbsp;⌀</small>}
  </span>

const Percentage = ({ value, average }) =>
  <span>
    {average && <small className='text-muted'>⌀&nbsp;</small>}
    <Round number={100 * value} />
    <small className='text-muted'>&nbsp;%</small>
  </span>

const overrideMinHeight = {
  minHeight: 0
}

const Stat = ({ name, children, average }) =>
  <div style={statStyle}>
    <div className='description-block border-right' style={overrideMinHeight}>
      <h5 className='description-header'>
        {children}
      </h5>
      <span className='description-percentage'>{name}</span>
    </div>
  </div>
