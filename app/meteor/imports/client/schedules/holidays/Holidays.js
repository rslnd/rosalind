import React from 'react'
import { __ } from '../../../i18n'
import { Box } from '../../components/Box'

export const Holidays = ({ table, form }) => (
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box
          title={__('schedules.holidaysNew')}
          type='primary'
          noBorder>
          {form}
        </Box>
      </div>
    </div>

    <div className='row'>
      <div className='col-md-12'>
        <Box
          title={__('schedules.futureHolidays')}
          noBorder>
          {table}
        </Box>
      </div>
    </div>
  </div>
)
