import React from 'react'
import { toClass } from 'recompose'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/InlineEditTable'
import { MultiTextField } from '../components/MultiTextField'
import { tagStyle, tagBackgroundColor } from './TagsList'
import { UserPicker } from '../users/UserPicker'
import { CalendarPicker } from '../calendars/CalendarPicker'
import { __ } from '../../i18n'
import { darken } from '../layout/styles'

const structure = ({ getCalendarName, getAssigneeName }) => [
  {
    header: '#',
    field: 'order'
  },
  {
    header: 'Kalender',
    field: 'calendarIds',
    EditComponent: CalendarPicker,
    isMulti: true,
    render: t => t.calendarIds && t.calendarIds.map(c => getCalendarName(c)).join(', ')
  },
  {
    icon: 'paint-brush',
    field: 'color',
    render: t => (
      <div style={{
        ...tagStyle,
        color: '#fff',
        backgroundColor: t.color || tagBackgroundColor,
        borderColor: darken(t.color),
        width: 20,
        height: 20
      }} />
    )
  },
  {
    header: 'Tag',
    field: 'tag',
    render: t => (
      <span style={{
        ...tagStyle,
        color: '#fff',
        backgroundColor: t.color || tagBackgroundColor,
        borderColor: darken(t.color)
      }}>
        {t.tag}
      </span>
    )
  },
  {
    icon: 'clock-o',
    description: 'Standard-Termindauer in Minuten',
    field: 'duration'
  },
  {
    icon: 'eur',
    description: 'Privat- oder Kassentermin',
    render: t => t.privateAppointment && <Icon name='eur' />,
    field: 'privateAppointment',
    type: Boolean
  },
  {
    header: 'Umsatz',
    field: 'defaultRevenue'
  },
  {
    header: 'von',
    field: 'minRevenue',
    unsetWhenEmpty: true
  },
  {
    header: 'bis',
    field: 'maxRevenue',
    unsetWhenEmpty: true
  },
  {
    header: 'Description',
    field: 'description'
  },
  {
    header: 'Bericht',
    field: 'reportAs'
  },
  {
    header: 'Spalte',
    field: 'reportHeader'
  },
  {
    header: 'ÄrztInnen',
    field: 'assigneeIds',
    EditComponent: UserPicker,
    isMulti: true,
    unsetWhenEmpty: true,
    render: t => <span>
      {
        t.assigneeIds && t.assigneeIds
          .map(a => getAssigneeName(a)).join(', ')
      }
    </span>
  },
  {
    header: <span style={{ textDecoration: 'line-through' }}>ÄrztInnen</span>,
    field: 'blacklistAssigneeIds',
    EditComponent: UserPicker,
    isMulti: true,
    unsetWhenEmpty: true,
    render: t => <span>
      {
        t.blacklistAssigneeIds &&
          <span style={{ textDecoration: 'line-through' }}>
            {
              t.blacklistAssigneeIds
                .map(a => getAssigneeName(a)).join(', ')
            }
          </span>
      }
    </span>
  },
  {
    header: 'Empfehlbar von',
    field: 'referrableFrom',
    EditComponent: CalendarPicker,
    isMulti: true,
    render: c => c.referrableFrom && <span>
      {c.referrableFrom.map(r =>
        <span key={r}>
          {getCalendarName(r)}
          <br />
        </span>
      )}
    </span>
  },
  {
    header: 'Max. Gleichzeitig',
    field: 'maxParallel'
  },
  {
    header: 'Synonyme',
    field: 'synonyms',
    multi: true,
    EditComponent: MultiTextField,
    render: t => t.synonyms && t.synonyms.join(', ')
  }
]

const defaultTag = () => ({
  tag: __('appointments.tag'),
  color: '#ccc'
})

export const TagsScreen = toClass(({ tags, getCalendarName, getAssigneeName, handleUpdate, handleInsert, handleRemove }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Tags' icon='tags'>
          <Table
            structure={structure}
            rows={tags}
            getCalendarName={getCalendarName}
            getAssigneeName={getAssigneeName}
            onUpdate={handleUpdate}
            onInsert={handleInsert}
            onRemove={handleRemove}
            defaultValues={defaultTag}
          />
        </Box>
      </div>
    </div>
  </div>
)
