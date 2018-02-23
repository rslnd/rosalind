import React from 'react'
import moment from 'moment'
import idx from 'idx'
import { percentage } from '../../util/format'
import { dayToDate } from '../../util/time/day'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Round } from './shared/Round'
import { integer } from '../../util/format'

export const Quarter = ({ quarter, calendar }) => (
  <div className='row'>
    <div className='col-md-12'>
      <Box title='Quartal' icon='line-chart'>
        <div className='row enable-select' style={{ display: 'flex' }}>
          {!calendar.privateAppointments && <DayCounter quarter={quarter} />}
          {!calendar.privateAppointments && <NewPerHour quarter={quarter} />}
          <NoShows quarter={quarter} />
          <RevenuePerDay quarter={quarter} />
          <Accumulated quarter={quarter} />
          <Projected quarter={quarter} />
        </div>
      </Box>
    </div>
  </div>
)

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

const statStyle = {
  minHeight: 0
}

const Stat = ({ name, children, average }) =>
  <div className='col-sm-2 col-xs-4' style={{ flex: 1 }}>
    <div className='description-block border-right' style={statStyle}>
      <h5 className='description-header'>
        {children}
      </h5>
      <span className='description-percentage'>{name}</span>
    </div>
  </div>
