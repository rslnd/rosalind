import React from 'react'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'

export const AppointmentActions = (props) => (
  <div>
    <div className="pull-left">
      {
        props.admitted
        ? <RaisedButton
          label={<span><Icon name="check" />&emsp;{TAPi18n.__('appointments.admit')}</span>}
          backgroundColor={'#C5E1A5'}
          onClick={props.unsetAdmitted} />
        : <RaisedButton
          label={<span><Icon name="check" />&emsp;{TAPi18n.__('appointments.admit')}</span>}
          onClick={props.setAdmitted} />
      }

      {
        props.canceled
        ? <RaisedButton
          label={<span>{TAPi18n.__('appointments.cancel')}&emsp;<Icon name="times" /></span>}
          backgroundColor={'#e4e3e3'}
          onClick={props.unsetCanceled} />
        : <RaisedButton
          label={<span>{TAPi18n.__('appointments.cancel')}&emsp;<Icon name="times" /></span>}
          onClick={props.setCanceled} />
      }

      {
        props.startMove &&
          <FlatButton
            style={{ marginLeft: 20 }}
            label={<span><Icon name="arrows" />&emsp;{TAPi18n.__('appointments.move')}</span>}
            onClick={props.startMove} />
      }

      <FlatButton
        style={{ marginLeft: 20 }}
        label={<span><Icon name="trash-o" />&emsp;{TAPi18n.__('appointments.softRemove')}</span>}
        onClick={props.softRemove} />
    </div>
    <div className="pull-right">
      <FlatButton
        onClick={props.onClose}
        label={TAPi18n.__('ui.close')} />
    </div>
  </div>
)
