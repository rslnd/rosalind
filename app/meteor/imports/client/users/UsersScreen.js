import React from 'react'
import { Link } from 'react-router-dom'
import sum from 'lodash/sum'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/Table'

const toggleablePermissions = [
  {
    permission: 'appointments',
    title: 'Kalender',
    icon: 'calendar'
  },
  {
    permission: 'waitlist',
    title: 'Warteliste',
    icon: 'angle-right'
  },
  {
    permission: 'schedules-edit',
    title: 'Anwesenheiten bearbeiten',
    icon: 'clock-o'
  },
  {
    permission: 'inboundCalls',
    title: 'Anrufe',
    icon: 'phone'
  },
  {
    permission: 'reports',
    title: 'Berichte',
    icon: 'bar-chart'
  },
  {
    permission: 'reports-showRevenue',
    title: 'Umsätze in Berichten',
    icon: 'eur'
  },
  {
    permission: 'edit-users',
    title: 'Benutzer verwalten',
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

  ...toggleablePermissions.map(({ title, icon, permission }) => ({
    header: { title, icon },
    style: { width: 45 },
    render: u => isInRole(u, permission) && <Icon name='check' />
  })),

  {
    header: { icon: 'key', title: 'Passwort' },
    render: u => <span>
      {(u.services && u.services.password && Object.keys(u.services.password).length >= 1) &&
        <Icon name='key' title='Passwort' />}
    </span>
  },

  {
    header: { icon: 'unlock-alt', title: 'Passwordless' },
    render: u => <span>
      {(u.services && u.services.passwordless) &&
        <Icon name='unlock-alt' title='Passwordless' />}
    </span>
  },

  {
    header: '',
    render: u => <Link to={`/users/${u._id}/edit`}>Bearbeiten</Link>,
    style: { width: 100, textAlign: 'right' }
  }
]

export const UsersScreen = ({ groups, getAssigneeName, handleUpdate, isInRole }) =>
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
