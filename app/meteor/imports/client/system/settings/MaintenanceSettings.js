import React from 'react'
import { Toggle, Choice } from 'belle'
import TextField from 'material-ui/TextField'
import { Icon } from '../../components/Icon'

export const MaintenanceSettings = ({ settings }) => (
  <div className='container'>
    <Toggle
      style={{transform: 'scale(0.6)'}}
      firstChoiceStyle={{backgroundColor: '#f39c12'}}
      secondChoiceStyle={{backgroundColor: '#bababa'}}
      value={settings.get('maintenance.enabled')}
      onUpdate={({ value }) => settings.set('maintenance.enabled', value)}>
      <Choice value><Icon name='exclamation-triangle' /></Choice>
      <Choice value={false}><Icon name='times' /></Choice>
    </Toggle>

    <br />

    Title: <b>{settings.get('maintenance.title')}</b><br />
    Message: <b>{settings.get('maintenance.message')}</b><br />

    <br />

    <TextField
      floatingLabelText={'Edit Title'}
      defaultValue={settings.get('maintenance.title')}
      width={500}
      onBlur={(e) => settings.set('maintenance.title', e.target.value)} />
    <br />
    <TextField
      floatingLabelText={'Edit Message'}
      defaultValue={settings.get('maintenance.message')}
      width={500}
      onBlur={(e) => settings.set('maintenance.message', e.target.value)} />
  </div>
)
