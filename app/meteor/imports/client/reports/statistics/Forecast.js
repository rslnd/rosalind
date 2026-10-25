import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'
import { Box } from '../../components/Box'
import { Tile, TileRow } from './Tile'
import { ForecastDoctorTable } from './ForecastDoctorTable'
import { LeadTimeSeriesChart } from './LeadTimeSeriesChart'
import { fmtInt } from './format'

const avoidBreak = { pageBreakInside: 'avoid' }

const dayTitle = (date) => {
  if (!date) { return __('reports.forecastTitle') }
  const m = moment(date)
  const isToday = m.isSame(moment(), 'day')
  const parts = [isToday && __('reports.today'), m.format('dd'), m.format('D. MMM YYYY')]
  return parts.filter(Boolean).join(' • ')
}

// Forecast view for today and future days: planned bookings for the day, not a
// retrospective.
export const Forecast = ({ forecast, date }) => {
  if (!forecast || !forecast.total) {
    return (
      <Box type='warning' title={__('ui.notice')}>
        <p>{__('reports.statisticsEmpty')}</p>
      </Box>
    )
  }

  const t = forecast.total

  return (
    <div>
      {/* Termine an dem Tag */}
      <Box title={dayTitle(forecast.date || date)} icon='calendar'>
        <TileRow style={{ marginBottom: 0 }}>
          <Tile label={__('reports.appointmentsTotal')}>{fmtInt(t.total)}</Tile>
          <Tile label={__('reports.einschuebe')}>{fmtInt(forecast.einschub)}</Tile>
          <Tile label={__('reports.insurance')}>{fmtInt(t.insurance)}</Tile>
          <Tile label={__('reports.privateShort')}>{fmtInt(t.private)}</Tile>
          <Tile label={__('reports.onlineBooked')}>{fmtInt(t.online)}</Tile>
          <Tile label={__('reports.internalShort')}>{fmtInt(t.internal)}</Tile>
        </TileRow>
      </Box>

      {/* Anwesende ÄrztInnen */}
      <Box title={__('reports.assignee_plural')} icon='users' style={avoidBreak}>
        <ForecastDoctorTable total={t} assignees={forecast.assignees} />
      </Box>

      {/* Vorlaufzeit Online vs. intern */}
      <Box title={__('reports.forecastLeadTitle')} icon='bar-chart' style={avoidBreak}>
        <p className='text-muted' style={{ marginTop: 0 }}>{__('reports.leadTimeHint')}</p>
        <LeadTimeSeriesChart distribution={forecast.leadTime} />
      </Box>
    </div>
  )
}
