import idx from 'idx'
import React from 'react'
import Alert from 'react-s-alert'
import identity from 'lodash/identity'
import { withProps } from 'recompose'
import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { Table } from '../components/InlineEditTable'
import { Box } from '../components/Box'
import { __ } from '../../i18n'
import { Templates } from '../../api/templates'
import { Tags } from '../../api/tags'
import { Meteor } from 'meteor/meteor'
import { DocumentPicker } from '../components/DocumentPicker'
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
    header: 'Behandlungen',
    field: 'tagIds',
    EditComponent: TagsPicker,
    isMulti: true,
    unsetWhenEmpty: true,
    render: t => t.tagIds && <TagsList tiny tags={t.tagIds} />
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

const TagsPicker = withProps({
  toDocument: _id => Tags.findOne({ _id }),
  toLabel: ({ _id }) => idx(Tags.findOne({ _id }), _ => _.tag),
  render: ({ value }) => <TagsList tiny tags={[value]} />,
  toKey: ({ _id }) => _id,
  options: () => Tags.find({}).fetch()
})(DocumentPicker)
