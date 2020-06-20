import React from 'react'
import identity from 'lodash/identity'
import { Box } from '../../components/Box'
import { Table } from '../../components/InlineEditTable'
import { TagsList } from '../../tags/TagsList'
import { Tags } from '../../../api/tags'
import { CalendarPicker } from '../../calendars/CalendarPicker'
import { DocumentPicker } from '../../components/DocumentPicker'
import { __ } from '../../../i18n'
import { withProps } from 'recompose'
import { UserPicker } from '../../users/UserPicker'
import { applyConstraintToTags } from '../../../api/constraints/methods/applyConstraintToTags'
import { HMtoString, stringToHM, stringToHMOrNull } from '../../../util/time/hm'
import { DayField } from '../../components/form'

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
    stringify: x => JSON.stringify(x),
    fromString: x => JSON.parse(x),
    render: constraint => constraint.tags &&
      <TagsList tags={applyConstraintToTags({
        constraint,
        tags: Tags.find({
          _id: {
            $in: constraint.tags.map(t => t.tagId)
          }
        }).fetch()
      })} />,
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
    field: 'assigneeIds',
    isMulti: true,
    EditComponent: UserPicker,
    render: t => t.assigneeIds && t.assigneeIds.map(getAssigneeName).join(', ')
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
    header: 'Dauer-Strategie',
    field: 'durationStrategy',
    render: DurationStrategy
  },
  {
    header: 'Uhrzeit von',
    render: ({ from }) => HMtoString(from),
    field: 'from',
    fromString: stringToHMOrNull,
    stringify: HMtoString,
    unsetWhenEmpty: true
  },
  {
    header: 'bis',
    render: ({ to }) => HMtoString(to),
    field: 'to',
    fromString: stringToHMOrNull,
    stringify: HMtoString,
    unsetWhenEmpty: true
  },
  {
    header: 'Gültig ab',
    field: 'validFrom',
    render: ({ validFrom }) => validFrom ? validFrom.toISOString() : '',
    stringify: v => v ? v.toISOString() : null,
    // EditComponent: DayField,
    unsetWhenEmpty: true,
    // plain: true
  },
  {
    header: 'bis',
    field: 'validTo',
    render: ({ validTo }) => validTo ? validTo.toISOString() : '',
    stringify: v => v ? v.toISOString() : null,
    // EditComponent: DayField,
    unsetWhenEmpty: true,
    // plain: true
  }
]

const DurationStrategy = ({ durationStrategy }) =>
  durationStrategy
    ? <span>{durationStrategy.name} {durationStrategy.upTo || null}</span>
    : null

const toWeekdayLabel = s => __(`time.${s}`)

const WeekdayPicker = withProps({
  toDocument: identity,
  toLabel: toWeekdayLabel,
  toKey: identity,
  options: () => ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
})(DocumentPicker)

export const ConstraintsScreen = ({
  getCalendarName,
  constraints,
  getAssigneeName,
  handleUpdate,
  handleInsert,
  handleRemove,
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
            onRemove={handleRemove}
            defaultValues={defaultValues}
          />
        </Box>
      </div>
    </div>
  </div>
