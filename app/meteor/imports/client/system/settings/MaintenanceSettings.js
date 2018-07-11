import React from 'react'
import TextField from '@material-ui/core/TextField'
import Switch from '@material-ui/core/Switch'

export const MaintenanceSettings = ({ settings }) => (
  <div className='container'>
    <Switch
      checked={settings.get('maintenance.enabled')}
      onChange={(e, v) => settings.set('maintenance.enabled', v)}
    />

    <br />

    Title: <b>{settings.get('maintenance.title')}</b><br />
    Message: <b>{settings.get('maintenance.message')}</b><br />

    <br />

    <TextField
      label={'Edit Title'}
      defaultValue={settings.get('maintenance.title')}
      width={500}
      onBlur={(e) => settings.set('maintenance.title', e.target.value)} />
    <br />
    <TextField
      label={'Edit Message'}
      defaultValue={settings.get('maintenance.message')}
      width={500}
      onBlur={(e) => settings.set('maintenance.message', e.target.value)} />
  </div>
)
