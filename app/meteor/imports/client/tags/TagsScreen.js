import React from 'react'
import { toClass, withProps } from 'recompose'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/InlineEditTable'
import { tagStyle, tagBackgroundColor } from './TagsList'
import { UserPicker } from '../users/UserPicker'
import { CalendarPicker } from '../calendars/CalendarPicker'
import { __ } from '../../i18n'
import { darken } from '../layout/styles'
import { DocumentPicker } from '../components/DocumentPicker'
import { Templates } from '../../api'
import idx from 'idx'

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
    unsetWhenEmpty: true,
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
    field: 'defaultRevenue',
    unsetWhenEmpty: true,
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
    field: 'description',
    unsetWhenEmpty: true,
  },
  {
    header: 'Bericht',
    field: 'reportAs',
    unsetWhenEmpty: true,
  },
  {
    header: 'Spalte',
    field: 'reportHeader',
    unsetWhenEmpty: true,
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
    unsetWhenEmpty: true,
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
    field: 'maxParallel',
    unsetWhenEmpty: true,
  },
  {
    header: 'Revers-Vorlage',
    field: 'consentTemplateId',
    unsetWhenEmpty: true,
    EditComponent: TemplatePicker,
    render: t => t.consentTemplateId && idx(Templates.findOne({ _id: t.consentTemplateId }), _ => _.name)
  },
  {
    header: 'Revers nötig?',
    field: 'isConsentRequired',
    type: Boolean
  },
  {
    header: 'Synonyme',
    field: 'synonyms',
    fromString: s => (s || '').split(', '),
    stringify: r => (r || []).join(', '),
    render: t => t.synonyms && t.synonyms.join(', ')
  },
  {
    header: 'Keine SMS',
    field: 'noSmsAppointmentReminder',
    type: Boolean
  },
  {
    header: 'Kurzbezeichnung im Kalender',
    field: 'shortTag',
    unsetWhenEmpty: true
  },
  {
    header: 'Textfarbe im Kalender',
    field: 'textColor',
    unsetWhenEmpty: true
  },
  {
    header: 'id',
    render: t => <pre>{t._id}</pre>
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

const TemplatePicker = withProps({
  toDocument: _id => Templates.findOne({ _id }),
  toLabel: ({ _id }) => idx(Templates.findOne({ _id }), _ => _.name),
  toKey: ({ _id }) => _id,
  options: () => Templates.find({}).fetch()
})(DocumentPicker)
