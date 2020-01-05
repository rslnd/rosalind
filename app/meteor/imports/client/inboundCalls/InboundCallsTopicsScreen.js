import React from 'react'
import Alert from 'react-s-alert'
import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { Table } from '../components/InlineEditTable'
import { Box } from '../components/Box'
import { __ } from '../../i18n'
import { MediaTags } from '../../api/media'
import { Meteor } from 'meteor/meteor'
import { InboundCallsTopics } from '../../api'

const composer = props => {
  Meteor.subscribe('media-tags')

  const topics = InboundCallsTopics.find({}, { sort: { order: 1 } }).fetch()

  const action = x => x
    .then(_ => Alert.success(__('ui.saved')))
    .catch(e => { console.error(e); Alert.error(__('ui.error')) })

  const handleUpdate = (inboundCallsTopicId, update) =>
    action(InboundCallsTopics.actions.update.callPromise({ inboundCallsTopicId, update }))

  const handleInsert = (inboundCallsTopic) =>
    action(InboundCallsTopics.actions.insert.callPromise({ inboundCallsTopic }))

  const handleRemove = inboundCallsTopicId =>
    action(InboundCallsTopics.actions.softRemove.callPromise({ inboundCallsTopicId }))

  return {
    topics,
    handleUpdate,
    handleInsert,
    handleRemove
  }
}

const defaultTopic = () => ({
  label: "Neue Rückrufliste",
  slug: "noname"
})

const structure = () => [
  {
    header: '#',
    field: 'order'
  },
  {
    header: 'Bezeichnung',
    field: 'label',
  },
  {
    header: 'Kurze Bezeichnung',
    field: 'labelShort'
  },
  {
    header: '🐌',
    field: 'slug'
  }
]

const Screen = toClass(({ topics, handleUpdate, handleInsert, handleRemove }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Rückruflisten' icon='phone'>
          <Table
            structure={structure}
            rows={topics}
            onUpdate={handleUpdate}
            onInsert={handleInsert}
            onRemove={handleRemove}
            defaultValues={defaultTopic}
          />
        </Box>
      </div>
    </div>
  </div>
)

export const InboundCallsTopicsScreen = withTracker(composer)(Screen)
