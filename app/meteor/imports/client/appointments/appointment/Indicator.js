import React from 'react'
import moment from 'moment-timezone'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
import { Currency } from '../../components/Currency'

const overlay = {
  opacity: 0.6
}

export const Indicator = ({ appointment, showRevenue }) => {
  const canceled = appointment.canceled || appointment.removed

  return appointment.patientId &&
    <span className='pull-right'>
      {
        !canceled && <span>{
          (appointment.treated || appointment.admitted)
            ? (<span
              key='show'
              title={TAPi18n.__('appointments.show')}
              style={{ display: 'inline-block', color: '#8fc6ae' }}>
              <Icon name='check' />&nbsp;
            </span>
          ) : ((moment().diff(appointment.end, 'minutes') >= 90) &&
            <span
              key='noShow'
              title={TAPi18n.__('appointments.noShow')}
              style={{ display: 'inline-block', color: '#e37067' }}>
              <Icon name='times' />&nbsp;
            </span>
          )
        }</span>
      }
    </span> || null
}

export const Revenue = ({ appointment }) =>
  <span>
    {
      (appointment.revenue === 0 || appointment.revenue > 0) &&
        <span>
          <Currency value={appointment.revenue} />&nbsp;
        </span>
    }
  </span>
