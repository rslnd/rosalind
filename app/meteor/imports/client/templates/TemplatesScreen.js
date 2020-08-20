import idx from 'idx'
import React from 'react'
import Alert from 'react-s-alert'
import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { Table } from '../components/InlineEditTable'
import { Box } from '../components/Box'
import { __ } from '../../i18n'
import { Templates } from '../../api/templates'
import { Meteor } from 'meteor/meteor'
import { TagsList } from '../tags/TagsList'

const composer = props => {
  Meteor.subscribe('templates')

  const templates = Templates.find({}, { sort: { kind: 1, order: 1 } }).fetch()

  const action = x => x
    .then(_ => Alert.success(__('ui.saved')))
    .catch(e => { console.error(e); Alert.error(__('ui.error')) })

  const handleUpdate = (templateId, update) =>
    action(Templates.actions.update.callPromise({ templateId, update }))

  const handleInsert = (template) =>
    action(Templates.actions.insert.callPromise({ template }))

  const handleRemove = templateId =>
    action(Templates.actions.softRemove.callPromise({ templateId }))

  return {
    templates,
    handleUpdate,
    handleInsert,
    handleRemove
  }
}

const defaultTemplate = () => ({
  type: 'consent',
  name: 'Revers',
  localPath: 'S:\\Vorlagen\\Revers.pdf',
})

const structure = () => [
  {
    header: 'Art',
    field: 'type'
  },
  {
    header: '#',
    field: 'order'
  },
  {
    header: 'Name',
    field: 'name'
  },
  {
    header: 'Lokaler Dateipfad',
    field: 'localPath'
  },
  {
    header: 'PDF',
    field: 'base64',
    type: 'file',
    accept: '.pdf,application/pdf,x-pdf'
  },
  {
    header: 'Platzhalter',
    field: 'placeholders',
    fromString: JSON.parse,
    stringify: s => JSON.stringify(s, null, 2),
    render: c => c.placeholders && <pre>{JSON.stringify(c.placeholders, null, 2)}</pre>,
    multiline: true,
    rowsMax: 20
  }
]

const Screen = toClass(({ templates, handleUpdate, handleInsert, handleRemove }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Vorlagen' icon='document'>
          <Table
            structure={structure}
            rows={templates}
            onUpdate={handleUpdate}
            onInsert={handleInsert}
            onRemove={handleRemove}
            defaultValues={defaultTemplate}
          />
        </Box>
      </div>
    </div>
  </div>
)

export const TemplatesScreen = withTracker(composer)(Screen)
