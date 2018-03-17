import React from 'react'
import Switch from 'material-ui/Switch'
import { FormGroup, FormControlLabel } from 'material-ui/Form'
import de from 'date-fns/locale/de'
import distanceInWordsToNow from 'date-fns'
import { toClass } from 'recompose'
import { Box } from '../components/Box'
import { Table } from '../components/Table'

const structure = ({ getCalendarName, getGroupName, getAssigneeName }) => [
  {
    header: '#',
    render: c => <pre>{c.clientKey.substr(0, 6)}…</pre>
  },
  {
    header: 'Beschreibung',
    field: 'description'
  },
  {
    header: 'Login ohne Passwort',
    render: c => c.passwordlessGroupIds && c.passwordlessGroupIds
      .map(g => getGroupName(g)).join(', ')
  },
  {
    header: 'Benutzer',
    render: c => c.lastActionBy && getAssigneeName(c.lastActionBy)
  },
  {
    header: 'Letzte Aktion',
    render: c => c.lastActionAt && distanceInWordsToNow(c.lastActionAt, { locale: de })
  },
  {
    header: 'System-Info',
    render: c => c.systemInfo && <pre>{JSON.stringify(c.systemInfo, null, 2)}</pre>
  },
  {
    header: 'Einstellungen',
    render: c => c.settings && <pre>{JSON.stringify(c.settings, null, 2)}</pre>
  }
]

export const ClientsScreen = toClass(({ clients, settings, getAssigneeName, getGroupName, handleUpdate }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Clients' icon='television'>
          <FormGroup row>
            <FormControlLabel
              control={<Switch
                checked={settings.get('clients.allowNewClients')}
                onChange={(e, v) => settings.set('clients.allowNewClients', v)}
              />}
              label='Neue Clients zulassen'
            />
          </FormGroup>
          <Table
            structure={structure}
            rows={clients}
            getAssigneeName={getAssigneeName}
            getGroupName={getGroupName}
            onUpdate={handleUpdate}
          />
        </Box>
      </div>
    </div>
  </div>
)
