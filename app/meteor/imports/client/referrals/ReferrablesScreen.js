import React from 'react'
import { toClass } from 'recompose'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/InlineEditTable'
import { CalendarPicker } from '../calendars/CalendarPicker'

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
    EditComponent: CalendarPicker,
    render: r => r.toTagId && getCalendarName(r.toTagId)
  }
]

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
