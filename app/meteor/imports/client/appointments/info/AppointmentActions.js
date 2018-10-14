import React from 'react'
import Button from '@material-ui/core/Button'
import { __ } from '../../../i18n'
import { Icon } from '../../components/Icon'

export const AppointmentActions = (props) => (
  <div>
    <div className='pull-left'>
      {
        props.admitted
        ? <Button
          disabled={props.isLoading}
          variant='contained'
          style={{ backgroundColor: '#C5E1A5' }}
          onClick={props.unsetAdmitted}>
          <span><Icon name='check' />&emsp;{__('appointments.admit')}</span>
        </Button>
        : <Button
          disabled={props.isLoading}
          variant='contained'
          style={{ backgroundColor: '#fff' }}
          onClick={props.setAdmitted}>
          <span><Icon name='check' />&emsp;{__('appointments.admit')}</span>
        </Button>
      }

      {
        props.canceled
        ? <Button
          disabled={props.isLoading}
          style={{ backgroundColor: '#e4e3e3', marginLeft: 20 }}
          onClick={props.unsetCanceled}>
          <span><Icon name='times' />&emsp;{__('appointments.canceled')}</span>
        </Button>
        : <Button
          disabled={props.isLoading}
          style={{ marginLeft: 20 }}
          onClick={props.setCanceled}>
          <span><Icon name='times' />&emsp;{__('appointments.cancel')}</span>
        </Button>
      }

      {
        props.startMove &&
          <Button
            disabled={props.isLoading}
            style={{ marginLeft: 20 }}
            onClick={props.startMove}>
            <span><Icon name='arrows' />&emsp;{__('appointments.move')}</span>
          </Button>
      }

      {
        props.viewInCalendar &&
          <Button
            disabled={props.isLoading}
            style={{ marginLeft: 20 }}
            onClick={props.viewInCalendar}>
            <span><Icon name='calendar' />&emsp;{__('appointments.viewInCalendar')}</span>
          </Button>
      }

      <Button
        disabled={props.isLoading}
        style={{ marginLeft: 20 }}
        onClick={props.softRemove}>
        <span><Icon name='trash-o' />&emsp;{__('appointments.softRemove')}</span>
      </Button>
    </div>
  </div>
)
