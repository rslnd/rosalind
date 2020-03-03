import React from 'react'
import Alert from 'react-s-alert'
import identity from 'lodash/identity'
import { withProps } from 'recompose'
import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { Table } from '../components/InlineEditTable'
import { Box } from '../components/Box'
import { __ } from '../../i18n'
import { MediaTags } from '../../api/media'
import { Meteor } from 'meteor/meteor'
import { DocumentPicker } from '../components/DocumentPicker'

const composer = props => {
  Meteor.subscribe('media-tags')

  const mediaTags = MediaTags.find({}, { sort: { kind: 1, order: 1 } }).fetch()

  const action = x => x
    .then(_ => Alert.success(__('ui.saved')))
    .catch(e => { console.error(e); Alert.error(__('ui.error')) })

  const handleUpdate = (mediaTagId, update) =>
    action(MediaTags.actions.update.callPromise({ mediaTagId, update }))

  const handleInsert = (mediaTag) =>
    action(MediaTags.actions.insert.callPromise({ mediaTag }))

  const handleRemove = mediaTagId =>
    action(MediaTags.actions.softRemove.callPromise({ mediaTagId }))

  return {
    mediaTags,
    handleUpdate,
    handleInsert,
    handleRemove
  }
}

const defaultMediaTag = () => ({
  kind: 'document',
  tag: 'Revers',
  tagPlural: 'Reverse',
  color: '#ccc'
})

const structure = () => [
  {
    header: 'Art',
    field: 'kind',
    EditComponent: KindPicker
  },
  {
    header: '#',
    field: 'order'
  },
  {
    header: 'Name (Einzahl)',
    field: 'tag'
  },
  {
    header: 'Name (Mehrzahl)',
    field: 'tagPlural'
  },
  {
    header: 'Farbe',
    field: 'color',
    render: ({ color }) => <div style={{ backgroundColor: color, width: 50, height: 32 }} />
  },
  {
    header: 'Revers?',
    field: 'isConsent',
    type: Boolean
  },
  {
    header: 'Gepinnt',
    field: 'pinned',
    type: Boolean
  }
]

const Screen = toClass(({ mediaTags, handleUpdate, handleInsert, handleRemove }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Kategorien für Medien' icon='camera'>
          <Table
            structure={structure}
            rows={mediaTags}
            onUpdate={handleUpdate}
            onInsert={handleInsert}
            onRemove={handleRemove}
            defaultValues={defaultMediaTag}
          />
        </Box>
      </div>
    </div>
  </div>
)

export const MediaTagsScreen = withTracker(composer)(Screen)

const KindPicker = withProps({
  toDocument: identity,
  toLabel: identity,
  toKey: identity,
  options: () => ['photo', 'document']
})(DocumentPicker)
