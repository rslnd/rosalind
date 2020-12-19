import React from 'react'
import Alert from 'react-s-alert'
import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { Table } from '../components/InlineEditTable'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { __ } from '../../i18n'
import { Groups as GroupsAPI } from '../../api/groups'

const composer = props => {
  const groups = GroupsAPI.find({}, { sort: { kind: 1, order: 1 } }).fetch()

  const action = x => x
    .then(_ => Alert.success(__('ui.saved')))
    .catch(e => { console.error(e); Alert.error(__('ui.error')) })

  const handleUpdate = (groupId, update) =>
    action(GroupsAPI.actions.update.callPromise({ groupId, update }))

  const handleInsert = (group) =>
    action(GroupsAPI.actions.insert.callPromise({ group }))

  const handleRemove = groupId =>
    action(GroupsAPI.actions.softRemove.callPromise({ groupId }))

  return {
    groups,
    handleUpdate,
    handleInsert,
    handleRemove
  }
}

const defaultGroup = () => ({
  name: 'ÄrztInnen',
  icon: 'user-md'
})

const structure = () => [
  {
    header: '#',
    field: 'order'
  },
  {
    name: 'Symbol',
    field: 'icon',
    render: ({ icon }) => <Icon name={icon} />
  },
  {
    name: 'Farbe',
    field: 'color'
  },
  {
    header: 'Name',
    field: 'name'
  },
  {
    header: 'Berechtigungen',
    field: 'baseRoles',
    fromString: s => (s || '').split(', '),
    stringify: r => (r || []).join(', '),
    render: ({ baseRoles }) => baseRoles && baseRoles.join(', ')
  }
]

const Screen = toClass(({ groups, handleUpdate, handleInsert, handleRemove }) =>
  <Box title='Gruppen'>
    <Table
      structure={structure}
      rows={groups}
      onUpdate={handleUpdate}
      onInsert={handleInsert}
      onRemove={handleRemove}
      defaultValues={defaultGroup}
    />
  </Box>
)

export const GroupsTable = withTracker(composer)(Screen)
