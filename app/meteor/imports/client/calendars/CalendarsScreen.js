import React from 'react'
import identity from 'lodash/identity'
import { DocumentPicker } from '../components/DocumentPicker'
import { agreements } from '../../api/patients/schema'
import Chip from '@material-ui/core/Chip'
import { __ } from '../../i18n'
import { toClass, withProps } from 'recompose'
import { Box } from '../components/Box'
import { Icon } from '../components/Icon'
import { Table } from '../components/InlineEditTable'
import { CalendarPicker } from './CalendarPicker'

import { buildMessageText } from '../../api/messages/methods/buildMessageText'
import moment from 'moment-timezone'
import { TextField } from '@material-ui/core'

const SMSField = ({ initialValue, ...props }) => {
  const value = ((props.input ? props.input.value : props.value) || initialValue)

  let text = false
  let error = false
  try {
    text = buildMessageText({ text: value }, { date: moment('2015-11-12T14:30:00+01:00').year(moment().year()) })
  } catch (e) {
    error = true
    text = e.message
  }

  text = error
    ? `Fehler: ${text}`
    : `${text.length} Zeichen. Beispiel: "${text}"`

  return <TextField
    {...props}
    value={value}
    multiline
    error={error}
    helperText={text} />
}

const colorStyle = {
  borderRadius: 4,
  padding: 4,
  margin: 2,
  width: 30,
  height: 30
}

const structure = ({ getCalendarName, getAssigneeName }) => [
  {
    header: '#',
    field: 'order'
  },
  {
    header: 'Farbe',
    field: 'color',
    render: t => (
      <div style={{ ...colorStyle, backgroundColor: t.color || '#ccc' }} />
    )
  },
  {
    header: 'Icon',
    field: 'icon',
    render: c => <Icon name={c.icon} />
  },
  {
    header: 'Private',
    field: 'privateAppointments',
    render: c => c.privateAppointments && <Icon name='eur' />
  },
  {
    header: 'Name',
    field: 'name'
  },
  {
    header: 'Slug',
    field: 'slug'
  },
  {
    header: 'Feldlänge',
    field: 'slotSize'
  },
  {
    header: 'Terminfeldlänge',
    field: 'slotSizeAppointment'
  },
  {
    header: 'Standard-Termindauer in Minuten',
    field: 'defaultDuration'
  },
  {
    header: 'Felder nur bei bestimmten Minuten',
    field: 'atMinutes',
    unsetWhenEmpty: true,
    fromString: s => (s || '').split(', ').map(x => parseInt(x)),
    stringify: r => (r || []).join(', '),
    render: t => t.atMinutes && t.atMinutes.join(', ')
  },
  {
    header: 'Schwarzer Punkt',
    field: 'allowBanningPatients',
    type: Boolean
  },
  {
    header: 'History',
    field: 'history',
    type: Boolean,
    render: c => c.history && <Icon name='check' />
  },
  {
    header: 'Einschub',
    field: 'allowUnassigned',
    type: Boolean,
    render: c => c.allowUnassigned && <Icon name='check' />
  },
  {
    header: 'Einschub-Spaltenbeschriftung',
    field: 'unassignedLabel'
  },
  {
    header: 'Report Addenda',
    render: c => c.reportAddenda && c.reportAddenda.map(s =>
      <Chip key={s} label={s} />
    )
  },
  {
    header: 'Bezeichnungen',
    render: c => <span>
      {c.assigneeName}<br />
      {c.assigneeNamePlural}<br />
      {c.patientName}<br />
      {c.patientNamePlural}<br />
    </span>
  },
  {
    header: 'Bericht',
    render: c => c.reportAs && c.reportAs.map(t =>
      <Chip key={t} label={t} />
    )
  },
  {
    header: 'Empfangen = Behandelt',
    field: 'admittedIsTreated',
    type: Boolean,
    render: c =>
      c.admittedIsTreated && <Icon name='check' />
  },
  {
    header: 'SMS',
    field: 'smsAppointmentReminder',
    type: Boolean,
    render: c =>
      c.smsAppointmentReminder && <Icon name='check' />
  },
  {
    header: 'SMS Erinnerung',
    field: 'smsAppointmentReminderText',
    EditComponent: SMSField
  },
  {
    header: 'SMS Storno',
    field: 'smsAppointmentReminderCancelationConfirmationText',
    EditComponent: SMSField
  },
  {
    header: 'Empfehlbar von',
    field: 'referrableFrom',
    EditComponent: CalendarPicker,
    isMulti: true,
    render: c => c.referrableFrom && c.referrableFrom.map(r =>
      <Chip key={r} label={getCalendarName(r)} />
    )
  },
  {
    header: 'Telefon Pflichtfeld?',
    field: 'requirePhone',
    type: Boolean,
    render: t => t.requirePhone && <Icon name='check' />
  },
  {
    header: 'Revers',
    field: 'consentRequired',
    render: t => t.consentRequired && <Icon name='check' />,
    type: Boolean
  },
  {
    header: 'Datenschutz',
    field: 'requiredAgreements',
    EditComponent: AgreementsPicker,
    isMulti: true,
    unsetWhenEmpty: true,
    render: c => c.requiredAgreements && c.requiredAgreements.map(s =>
      <Chip key={s} label={toAgreementLabel(s)} />
    )
  },
  {
    header: 'Anrufliste',
    field: 'acceptInboundCalls'
  },
  {
    header: 'Termine zwischen Spalten verschieben',
    field: 'allowMoveBetweenAssignees',
    type: Boolean,
    render: t => t.allowMoveBetweenAssignees && <Icon name='check' />
  }
]

const toAgreementLabel = s => __(`patients.agreements.${s}.label`)

const AgreementsPicker = withProps({
  toDocument: identity,
  toLabel: toAgreementLabel,
  toKey: identity,
  options: () => agreements
})(DocumentPicker)

const defaultCalendar = () => ({
  name: 'Termine',
  color: '#c0ffee',
  slug: 'termine',
  icon: 'calendar-o'
})

export const CalendarsScreen = toClass(({ calendars, getCalendarName, getAssigneeName, handleUpdate, handleInsert, handleRemove }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Kalender' icon='calendar'>
          <Table
            structure={structure}
            rows={calendars}
            getCalendarName={getCalendarName}
            getAssigneeName={getAssigneeName}
            onUpdate={handleUpdate}
            onInsert={handleInsert}
            onRemove={handleRemove}
            defaultValues={defaultCalendar}
          />
        </Box>
      </div>
    </div>
  </div>
)
