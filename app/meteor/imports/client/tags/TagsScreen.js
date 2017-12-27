import React from 'react'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/Table'
import { tagStyle } from './TagsList'

const structure = ({ getCalendarName, getAssigneeName }) => [
  {
    header: '#',
    render: t => t.order
  },
  {
    header: 'Kalender',
    render: t => t.calendarIds && t.calendarIds.map(c => getCalendarName(c)).join(', ')
  },
  {
    header: 'Tag',
    render: t => (
      <span style={{...tagStyle, backgroundColor: t.color || '#ccc'}}>
        {t.tag}
      </span>
    )
  },
  {
    header: { icon: 'clock-o', title: 'Standard-Termindauer in Minuten' },
    render: t => t.duration
  },
  {
    header: { icon: 'eur', title: 'Privat- oder Kassentermin' },
    render: t => t.privateAppointment && <Icon name='eur' />
  },
  {
    header: 'Description',
    render: t => t.description
  },
  {
    header: 'ÄrztInnen',
    render: t => t.assigneeIds && t.assigneeIds.map(a => getAssigneeName(a)).join(', ')
  }
]

export const TagsScreen = ({ tags, getCalendarName, getAssigneeName }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Tags' icon='tags'>
          <Table
            structure={structure}
            data={tags}
            getCalendarName={getCalendarName}
            getAssigneeName={getAssigneeName}
          />
        </Box>
      </div>
    </div>
  </div>
