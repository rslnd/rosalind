import React from 'react'
import Button from 'material-ui/Button'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'

export const AppointmentActions = (props) => (
  <div>
    <div className='pull-left'>
      {
        props.admitted
        ? <Button
          variant='raised'
          style={{ backgroundColor: '#C5E1A5' }}
          onClick={props.unsetAdmitted}>
          <span><Icon name='check' />&emsp;{TAPi18n.__('appointments.admit')}</span>
        </Button>
        : <Button
          variant='raised'
          style={{ backgroundColor: '#fff' }}
          onClick={props.setAdmitted}>
          <span><Icon name='check' />&emsp;{TAPi18n.__('appointments.admit')}</span>
        </Button>
      }

      {
        props.canceled
        ? <Button
          style={{ backgroundColor: '#e4e3e3', marginLeft: 20 }}
          onClick={props.unsetCanceled}>
          <span><Icon name='times' />&emsp;{TAPi18n.__('appointments.canceled')}</span>
        </Button>
        : <Button
          style={{ marginLeft: 20 }}
          onClick={props.setCanceled}>
          <span><Icon name='times' />&emsp;{TAPi18n.__('appointments.cancel')}</span>
        </Button>
      }

      {
        props.startMove &&
          <Button
            style={{ marginLeft: 20 }}
            onClick={props.startMove}>
            <span><Icon name='arrows' />&emsp;{TAPi18n.__('appointments.move')}</span>
          </Button>
      }

      {
        props.viewInCalendar &&
          <Button
            style={{ marginLeft: 20 }}
            onClick={props.viewInCalendar}>
            <span><Icon name='calendar' />&emsp;{TAPi18n.__('appointments.viewInCalendar')}</span>
          </Button>
      }

      <Button
        style={{ marginLeft: 20 }}
        onClick={props.softRemove}>
        <span><Icon name='trash-o' />&emsp;{TAPi18n.__('appointments.softRemove')}</span>
      </Button>
    </div>
  </div>
)
