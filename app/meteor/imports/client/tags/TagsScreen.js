import React from 'react'
import Portal from 'react-portal'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/Table'
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
    header: 'Tag',
    field: 'color',
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
    render: t => t.privateAppointment && <Icon name='eur' />
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
    render: t => t.assigneeIds && t.assigneeIds.map(a => getAssigneeName(a)).join(', ')
  }
]

export const TagsScreen = ({ tags, getCalendarName, getAssigneeName, handleUpdate }) =>
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
