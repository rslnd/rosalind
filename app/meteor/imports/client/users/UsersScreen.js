import React from 'react'
import isEqual from 'lodash/isEqual'
import Alert from 'react-s-alert'
import { Link } from 'react-router-dom'
import sum from 'lodash/sum'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/InlineEditTable'
import { ClientsPicker } from '../clients/ClientsPicker'
import { subscribe } from '../../util/meteor/subscribe'
import { withTracker } from '../components/withTracker'
import { TextField, Button } from '@material-ui/core'
import { compose, withState, withProps, withHandlers } from 'recompose'
import { Groups } from '../../api/groups'
import { rolesToString, stringToRoles } from './ChangeRolesForm'
import { __ } from '../../i18n'

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

  {
    header: 'Zusätzliche Berechtigungen',
    render: u => rolesToString(u.addedRoles)
  },

  {
    header: 'Entfernte Berechtigungen',
    render: u => rolesToString(u.removedRoles)
  },

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
    unsetWhenEmpty: true,
    isMulti: true,
    EditComponent: ClientsPicker,
    render: u => u.allowedClientIds && u.allowedClientIds.length
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

export const UsersScreen = withTracker(composer)(({ groups, getAssigneeName, handleUpdate, isInRole, removed }) =>
  <div>
    <div className='content-header enable-select show-print'>
      <h1>
        Verwaltung
        &nbsp;
        { removed && <span>({__('ui.removed')})&nbsp;</span>}
        <small>
          {sum(groups.map(g => g.users.filter(u => !u.removed).length))} aktive Zugänge
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

                <SetBaseRoles group={group} />

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

      <div className='row'>
        <div className='col-md-12 enable-select'>
          {
            removed
            ? <Box title='Aktive Zugänge' icon='users'>
              <Link to='/users/'>Aktive Zugänge anzeigen</Link>
            </Box>
            : <Box title='Gelöschte Zugänge' icon='trash'>
              <Link to='/users/removed'>Gelöschte Zugänge anzeigen</Link>
            </Box>
          }
        </div>
      </div>
    </div>
  </div>
)

const SetBaseRoles = compose(
  withState('newBaseRoles', 'setNewBaseRoles', null),
  withProps(props => ({
    baseRoles: rolesToString(props.group.baseRoles)
  })),
  withProps(props => ({
    newBaseRoles: props.newBaseRoles === null ? props.baseRoles : props.newBaseRoles
  })),
  withHandlers({
    handleSubmit: props => e => Groups.actions.setBaseRoles.callPromise({
      groupId: props.group._id,
      baseRoles: stringToRoles(props.newBaseRoles)
    }).then(_ => Alert.success('OK')).catch(e => {
      console.error(e)
      Alert.error(e.message)
    })
  })
)(({ group, newBaseRoles, setNewBaseRoles, handleSubmit }) =>
  <div style={rolesStyle}>
    <TextField
      value={newBaseRoles}
      onChange={e => setNewBaseRoles(e.target.value)}
      fullWidth
      label='Basis-Gruppenberechtigungen'
    />

    {
      !isEqual(rolesToString(group.baseRoles), newBaseRoles) &&
        <Button
          onClick={handleSubmit}
        >Speichern</Button>
    }
  </div>
)

const rolesStyle = {
  padding: 10
}
