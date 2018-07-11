import React from 'react'
import Switch from '@material-ui/core/Switch'

export const MessagesSettings = ({ settings }) => (
  <div className='container'>
    <Switch
      checked={settings.get('messages.sms.enabled')}
      onChange={(e, v) => settings.set('messages.sms.enabled', v)}
    />
  </div>
)
