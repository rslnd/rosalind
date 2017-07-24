import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { Box } from '../../components/Box'

export const Holidays = ({ table, form }) => (
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box
          title={TAPi18n.__('schedules.holidaysNew')}
          type='primary'
          noBorder>
          {form}
        </Box>
      </div>
    </div>

    <div className='row'>
      <div className='col-md-12'>
        {table}
      </div>
    </div>
  </div>
)
