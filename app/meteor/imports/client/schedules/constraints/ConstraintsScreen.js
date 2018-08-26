import React from 'react'
import { Box } from '../../components/Box'
import { Icon } from '../../components/Icon'
import { Table } from '../../components/InlineEditTable'
import { tagStyle, tagBackgroundColor } from '../../tags/TagsList'
import { Tags } from '../../../api/tags'

const structure = ({ getCalendarName, getAssigneeName }) => [
  {
    header: 'Kalender',
    render: t => t.calendarIds.map(getCalendarName).join(', ')
  },
  {
    header: 'Behandlungen',
    render: c => c.tags && Tags.methods.expand(c.tags).map(t =>
      <span key={t._id}>
        <span style={{
          ...tagStyle,
          color: 'white',
          backgroundColor: t.color || tagBackgroundColor
        }}>
          {t.tag}
        </span>
        &ensp;
      </span>
    ),
    style: {
      width: '35%'
    }
  },
  {
    header: 'Notiz',
    field: 'note'
  },
  {
    header: 'ÄrztIn',
    render: t => t.userId && getAssigneeName(t.userId)
  },
  {
    header: 'Dauer',
    field: 'duration'
  },
  {
    header: 'von',
    field: 'hourStart'
  },
  {
    header: 'bis',
    field: 'hourEnd'
  },
  {
    header: 'Wochentage',
    render: c => c.weekdays && c.weekdays.join(', ')
  }
]

export const ConstraintsScreen = ({ getCalendarName, constraints, getAssigneeName, handleUpdate }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Terminplaner-Sonderregeln' icon='code-fork' color='primary'>
          <Table
            structure={structure}
            rows={constraints}
            getCalendarName={getCalendarName}
            getAssigneeName={getAssigneeName}
            onUpdate={handleUpdate}
          />
        </Box>
      </div>
    </div>
  </div>
