import React from 'react'
import { Box } from '../../components/Box'
import { MessagesSettings } from './MessagesSettings'
import { MaintenanceSettings } from './MaintenanceSettings'

export const SettingsScreen = ({ settings, get, set }) => (
  <div className='content'>
    <Box title='SMS'>
      <MessagesSettings settings={settings} get={get} set={set} />
    </Box>

    <Box title='Maintenance Mode'>
      <MaintenanceSettings settings={settings} get={get} set={set} />
    </Box>
  </div>
)
