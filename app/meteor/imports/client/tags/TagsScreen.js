import React from 'react'
import { toClass } from 'recompose'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/InlineEditTable'
import { tagStyle, tagBackgroundColor, darken } from './TagsList'

const structure = ({ getCalendarName, getAssigneeName }) => [
  {
    header: '#',
    field: 'order'
  },
  {
    header: 'Kalender',
    render: t => t.calendarIds && t.calendarIds.map(c => getCalendarName(c)).join(', ')
  },
  {
    header: { icon: 'paint-brush' },
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
    header: { icon: 'clock-o', title: 'Standard-Termindauer in Minuten' },
    field: 'duration'
  },
  {
    header: { icon: 'eur', title: 'Privat- oder Kassentermin' },
    render: t => t.privateAppointment && <Icon name='eur' />,
    field: 'privateAppointment',
    type: Boolean
  },
  {
    header: 'Umsatz',
    field: 'defaultRevenue'
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
    type: 'userId',
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
    header: <s>ÄrztInnen</s>,
    field: 'blacklistAssigneeIds',
    type: 'userId',
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
    render: c => c.referrableFrom && <span>
      {c.referrableFrom.map(r =>
        <span key={r}>
          {getCalendarName(r)}
          <br />
        </span>
      )}
    </span>
  }
]

export const TagsScreen = toClass(({ tags, getCalendarName, getAssigneeName, handleUpdate }) =>
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
          />
        </Box>
      </div>
    </div>
  </div>
)
