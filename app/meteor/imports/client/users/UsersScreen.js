import React from 'react'
import { Link } from 'react-router-dom'
import sum from 'lodash/sum'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/InlineEditTable'
import { ClientsPicker } from '../clients/ClientsPicker'
import { subscribe } from '../../util/meteor/subscribe'
import { withTracker } from '../components/withTracker'

const toggleablePermissions = [
  {
    permission: 'appointments',
    description: 'Kalender',
    icon: 'calendar'
  },
  {
    permission: 'waitlist',
    description: 'Warteliste',
    icon: 'angle-double-right'
  },
  {
    permission: 'schedules-edit',
    description: 'Anwesenheiten bearbeiten',
    icon: 'clock-o'
  },
  {
    permission: 'inboundCalls',
    description: 'Anrufe',
    icon: 'phone'
  },
  {
    permission: 'reports',
    description: 'Berichte',
    icon: 'bar-chart'
  },
  {
    permission: 'reports-showRevenue',
    description: 'Umsätze in Berichten',
    icon: 'eur'
  },
  {
    permission: 'users-edit',
    description: 'Benutzer verwalten',
    icon: 'user-plus'
  }
]

const structure = ({ getAssigneeName, isInRole }) => [
  {
    header: '',
    render: u => u.username,
    style: { width: 70, textAlign: 'right', fontWeight: 700 }
  },
  {
    header: 'Name',
    render: u => getAssigneeName(u._id)
  },

  ...toggleablePermissions.map(({ description, icon, permission }) => ({
    description,
    icon,
    style: { width: 45 },
    render: u => isInRole(u, permission) && <Icon name='check' />
  })),

  {
    icon: 'key',
    description: 'Passwort',
    render: u => {
      const hasPassword = (u.services && u.services.password && Object.keys(u.services.password).length >= 1)
      return <span>
        {
          u.weakPassword
            ? <span style={{ color: 'red' }}><Icon name='key' title='Passwort' /></span>
            : hasPassword
              ? <Icon name='key' title='Passwort' />
              : null
        }
      </span>
    }
  },

  {
    icon: 'unlock-alt',
    description: 'Passwordless',
    render: u => <span>
      {(u.services && u.services.passwordless) &&
        <Icon name='unlock-alt' title='Passwordless' />}
    </span>
  },

  {
    icon: 'desktop',
    field: 'allowedClientIds',
    description: 'Restrict Login to Client Ids',
    isMulti: true,
    EditComponent: ClientsPicker,
    render: c => c.allowedClientIds && c.allowedClientIds.length
  },

  {
    header: '',
    render: u => <Link to={`/users/${u._id}/edit`}>Bearbeiten</Link>,
    style: { width: 100, textAlign: 'right' }
  }
]

const composer = props => {
  subscribe('clients')
  return props
}

export const UsersScreen = withTracker(composer)(({ groups, getAssigneeName, handleUpdate, isInRole }) =>
  <div>
    <div className='content-header enable-select show-print'>
      <h1>
        Verwaltung
        &nbsp;
        <small>
          {sum(groups.map(g => g.users.length))} aktive Zugänge
        </small>
      </h1>
    </div>

    <div className='content'>
      <div className='row'>
        <div className='col-md-12 enable-select'>

          {
            groups.map(group =>
              <Box
                key={group._id}
                title={group.name}
                icon={group.icon}
                badge={group.users.length}
                noPadding>
                <Table
                  structure={structure}
                  rows={group.users}
                  getAssigneeName={getAssigneeName}
                  isInRole={isInRole}
                  onUpdate={handleUpdate}
                />
              </Box>
            )
          }
        </div>
      </div>
    </div>
  </div>
)
