import React from 'react'
import { toClass } from 'recompose'
import { Box } from '../../components/Box'
import { Table } from '../../components/InlineEditTable'
import { MessagesSettings } from './MessagesSettings'
import { MaintenanceSettings } from './MaintenanceSettings'

const defaultSetting = () => ({
  key: 'key',
  value: 'value',
  isPublic: false,
})

const structure = () => [
  {
    header: 'Key',
    field: 'key',
    render: s => <pre>{s.key}</pre>
  },
  {
    header: 'isPublic',
    field: 'isPublic',
    type: Boolean
  },
  {
    header: 'Value',
    field: 'value',
    fromString: JSON.parse,
    stringify: s => JSON.stringify(s, null, 2),
    render: s => s.value && <pre>{JSON.stringify(s.value, null, 2)}</pre>,
    multiline: true,
    rowsMax: 20
  }
]

export const SettingsScreen = toClass(({ handleUpdate, handleInsert, handleRemove, settings, get, set }) => (
  <div className='content'>
    <Box title='SMS' icon='commenting'>
      <MessagesSettings settings={settings} get={get} set={set} />
    </Box>

    <Box type='warning' title='Warnmeldung' icon='exclamation-triangle'>
      <MaintenanceSettings settings={settings} get={get} set={set} />
    </Box>

    <Box type='danger' title='Weitere Einstellungen' icon='wrench'>
      <Table
        structure={structure}
        rows={settings}
        onUpdate={handleUpdate}
        onInsert={handleInsert}
        onRemove={handleRemove}
        defaultValues={defaultSetting}
      />
    </Box>
  </div>
))
