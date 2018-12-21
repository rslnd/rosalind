import React from 'react'
import Switch from '@material-ui/core/Switch'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import de from 'date-fns/locale/de'
import { formatDistance } from 'date-fns'
import { toClass, withProps } from 'recompose'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/InlineEditTable'
import { GroupPicker } from '../users/GroupPicker'

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
    icon: 'ban',
    description: 'Gesperrt',
    field: 'isBanned',
    render: c => c.isBanned && <Icon name='ban' />,
    type: Boolean
  },
  {
    header: 'Login ohne Passwort nur für bestimmte Benutzergruppen',
    field: 'passwordlessGroupIds',
    EditComponent: GroupPicker,
    isMulti: true,
    render: c => c.passwordlessGroupIds && c.passwordlessGroupIds
      .map(g => getGroupName(g)).join(', ')
  },
  {
    header: 'Letzter Benutzer',
    render: c => c.lastActionBy && getAssigneeName(c.lastActionBy)
  },
  {
    header: 'Letzte Aktion',
    render: c => c.lastActionAt && formatDistance(c.lastActionAt, new Date(), { locale: de })
  },
  {
    header: 'System-Info',
    render: c => c.systemInfo && <pre>{JSON.stringify(c.systemInfo, null, 2)}</pre>
  },
  {
    header: 'Einstellungen',
    render: c => c.settings && <pre>{JSON.stringify(c.settings, null, 2)}</pre>
  },
  {
    header: 'Kann mit Kamera verbunden werden',
    field: 'pairingAllowed',
    render: c => c.pairingAllowed && <Icon name='check' />,
    type: Boolean
  },
  {
    header: 'Pairing Token',
    render: c => c.pairingToken && <pre>{c.pairingToken.substr(0, 6)}…</pre>
  },
  {
    header: 'Verbunden mit',
    render: c => c.pairedTo && <pre>{c.pairedTo}</pre>
  },
  {
    header: 'Verbunden am',
    render: c => c.pairedAt && formatDistance(c.pairedAt, new Date(), { locale: de })
  },
  {
    header: 'Verbunden von',
    render: c => c.pairedBy && getAssigneeName(c.pairedBy)
  }
]

export const ClientsScreen = toClass(({ clients, settings, getAssigneeName, getGroupName, handleUpdate, handleRemove }) =>
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
            onRemove={handleRemove}
          />
        </Box>
      </div>
    </div>
  </div>
)
