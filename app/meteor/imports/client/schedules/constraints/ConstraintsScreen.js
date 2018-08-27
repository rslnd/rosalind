import React from 'react'
import identity from 'lodash/identity'
import { Box } from '../../components/Box'
import { Icon } from '../../components/Icon'
import { Table } from '../../components/InlineEditTable'
import { tagStyle, tagBackgroundColor, TagsList } from '../../tags/TagsList'
import { Tags } from '../../../api/tags'
import { CalendarPicker } from '../../calendars/CalendarPicker'
import { DocumentPicker } from '../../components/DocumentPicker'
import { __ } from '../../../i18n'
import { withProps, mapProps, renderComponent } from 'recompose'
import { UserPicker } from '../../users/UserPicker';

const structure = ({ getCalendarName, getAssigneeName }) => [
  {
    header: 'Kalender',
    field: 'calendarId',
    render: t => getCalendarName(t.calendarId),
    EditComponent: CalendarPicker
  },
  {
    header: 'Behandlungen',
    field: 'tags',
    EditComponent: TagsPicker,
    isMulti: true,
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
    field: 'userId',
    EditComponent: UserPicker,
    render: t => t.userId && getAssigneeName(t.userId)
  },
  {
    header: 'Wochentage',
    field: 'weekdays',
    EditComponent: WeekdayPicker,
    isMulti: true,
    unsetWhenEmpty: true,
    render: c => c.weekdays && c.weekdays.map(toWeekdayLabel).join(', ')
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
  }
]

const toWeekdayLabel = s => __(`time.${s}`)

const WeekdayPicker = withProps({
  toDocument: identity,
  toLabel: toWeekdayLabel,
  toKey: identity,
  options: () => ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
})(DocumentPicker)

const TagsPicker = withProps({
  toDocument: _id => Tags.findOne({ _id }),
  toLabel: mapProps(tag => ({ tags: [ tag ] }))(TagsList),
  options: () => Tags.find({}).fetch()
})(DocumentPicker)

export const ConstraintsScreen = ({
  getCalendarName,
  constraints,
  getAssigneeName,
  handleUpdate,
  handleInsert,
  defaultValues
}) =>
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
            onInsert={handleInsert}
            defaultValues={defaultValues}
          />
        </Box>
      </div>
    </div>
  </div>
