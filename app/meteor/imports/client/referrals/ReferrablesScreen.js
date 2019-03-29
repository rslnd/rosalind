import React from 'react'
import { toClass, withProps } from 'recompose'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/InlineEditTable'
import { CalendarPicker } from '../calendars/CalendarPicker'
import { DocumentPicker } from '../components/DocumentPicker';
import idx from 'idx';
import { Tags } from '../../api';
import { TagsList } from '../tags/TagsList';

const structure = ({ getCalendarName, getTag }) => [
  {
    header: '#',
    field: 'order'
  },

  {
    field: 'icon',
    render: r => r.icon && <Icon name={r.icon} />
  },

  {
    header: 'Name',
    field: 'name'
  },

  {
    header: 'Von Kalender',
    field: 'fromCalendarIds',
    unsetWhenEmpty: true,
    isMulti: true,
    EditComponent: CalendarPicker,
    render: r => r.fromCalendarIds && r.fromCalendarIds.map(getCalendarName).join(', ')
  },

  {
    header: 'Zu Kalender',
    field: 'toCalendarId',
    unsetWhenEmpty: true,
    EditComponent: CalendarPicker,
    render: r => r.toCalendarId && getCalendarName(r.toCalendarId)
  },

  {
    header: 'Zu Behandlung',
    field: 'toTagId',
    unsetWhenEmpty: true,
    EditComponent: TagsPicker,
    render: r => r.toTagId && <TagsList tiny tags={[r.toTagId]} />
  }
]

const TagsPicker = withProps({
  toDocument: _id => Tags.findOne({ _id }),
  toLabel: ({ _id }) => idx(Tags.findOne({ _id }), _ => _.tag),
  render: ({ value }) => <TagsList tiny tags={[value]} />,
  toKey: ({ _id }) => _id,
  options: () => Tags.find({}).fetch()
})(DocumentPicker)

export const ReferrablesScreen = toClass(({ referrables, getCalendarName, getAssigneeName, handleUpdate, handleInsert, handleRemove, defaultReferrable }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Empfehlungen' icon='share'>
          <Table
            structure={structure}
            rows={referrables}
            getCalendarName={getCalendarName}
            getAssigneeName={getAssigneeName}
            onUpdate={handleUpdate}
            onInsert={handleInsert}
            onRemove={handleRemove}
            defaultValues={defaultReferrable}
          />
        </Box>
      </div>
    </div>
  </div>
)
