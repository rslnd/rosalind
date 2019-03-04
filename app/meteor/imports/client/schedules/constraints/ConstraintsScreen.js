import idx from 'idx'
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
import { UserPicker } from '../../users/UserPicker'
import { HMRangeToString } from '../../../util/time/hm'
import { applyConstraintToTags } from '../../../api/constraints/methods/applyConstraintToTags'

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
    header: 'Uhrzeit',
    render: ({ from, to }) => HMRangeToString({ from, to })
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

const TagsPicker = withProps({
  toDocument: ({ tagId }) => ({ tagId, ...Tags.findOne({ _id: tagId }) }),
  toLabel: ({ tagId }) => idx(Tags.findOne({ _id: tagId }), _ => _.tag),
  render: ({ value: { tagId } }) => <TagsList tags={[tagId]} />,
  toKey: ({ tagId }) => tagId,
  options: () => Tags.find({}).fetch().map(({ _id, ...t }) => ({ tagId: _id, ...t }))
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
