import { Meteor } from 'meteor/meteor'
import idx from 'idx'
import Alert from 'react-s-alert'
import uniq from 'lodash/uniq'
import moment from 'moment-timezone'
import React, { useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import { DocumentPicker } from '../components/DocumentPicker'
import { Icon } from '../components/Icon'
import { TagsList } from '../tags/TagsList'
import { getClientKey, toNative } from '../../startup/client/native/events'
import { Clients, MediaTags, Media, Appointments, Templates, Tags, Users, Patients } from '../../api'
import { Close } from './Close'
import { withTracker } from '../components/withTracker'
import { __ } from '../../i18n'
import { Preview } from '../media/Drawer'
import { withProps } from 'recompose'
import { getClient } from '../../api/clients/methods/getClient'
import { hasRole } from '../../util/meteor/hasRole'
import { fillPlaceholders } from '../templates/fillPlaceholders'
import { dayToDate } from '../../util/time/day'

export const setNextMedia = ({ patientId, appointmentId, cycle, tagIds = [] }) => {
  const clientKey = getClientKey()
  if (clientKey) {
    Clients.actions.setNextMedia.callPromise({
      clientKey,
      patientId,
      appointmentId,
      cycle,
      tagIds
    })
  }
}

const composer = props => {
  const { appointmentId, patientId } = props

  const appointment = Appointments.findOne({ _id: appointmentId })
  const appointmentsWithSameTags = Appointments.find({
    patientId,
    tags: { $in: appointment.tags },
    $or: [
      { assigneeId: appointment.assigneeId },
      { waitlistAssigneeId: appointment.assigneeId }
    ]
  }, {
    sort: { start: -1 },
    limit: 10
  }).fetch()

  const consentTags = MediaTags.find({ isConsent: true }).fetch()
  const pastConsentMedias = Media.find({
    tagIds: { $in: consentTags.map(t => t._id) },
    appointmentId: { $in: appointmentsWithSameTags.map(a => a._id) }
  }).fetch()

  const pastAppointmentsWithConsents = appointmentsWithSameTags
    .filter(pa =>
      pastConsentMedias.map(m => m.appointmentId)
      .indexOf(pa._id) !== -1)
    .map(pa => ({
      ...pa,
      consentMedias: pastConsentMedias.filter(m => m.appointmentId === pa._id)
    }))

  const patient = Patients.findOne({ _id: appointment.patientId })
  const assignee = Users.findOne({ _id: appointment.waitlistAssigneeId || appointment.assigneeId })

  return {
    ...props,
    appointment,
    patient,
    assignee,
    pastAppointmentsWithConsents
  }
}

const TemplatePicker = withProps({
  toDocument: _id => Templates.findOne({ _id }),
  toLabel: ({ _id }) => idx(Templates.findOne({ _id }), _ => _.name),
  render: ({ name }) => name,
  toKey: ({ _id }) => _id,
  options: () => Templates.find({}, { sort: { order: 1}}).fetch()
})(DocumentPicker)


export const Popover = withTracker(composer)(({
  open,
  onClose,
  appointmentId,
  patientId,
  patient,
  assignee,
  scan,
  handleMediaClick,
  appointment,
  pastAppointmentsWithConsents,
}) => {
  const canPrint = hasRole(Meteor.userId(), ['templates-print'])

  const defaultTemplateId = (
    Tags.methods.expand(appointment.tags || [])
    .find(t => t.consentTemplateId) || {}).consentTemplateId

  const [templateId, setTemplateId] = useState(defaultTemplateId)

  const handlePrint = async () => {
    if (!templateId) { return }
    const template = Templates.findOne({ _id: templateId })
    if (!template) { return }

    let base64 = null

    try {
      base64 = await fillPlaceholders({
        base64: template.base64,
        placeholders: template.placeholders,
        values: {
          patientFullNameWithTitle: Users.methods.fullNameWithTitle(patient),
          assigneeFullNameWithTitle: Users.methods.fullNameWithTitle(assignee),
          birthday: moment(dayToDate(patient.birthday)).format(__('time.dateFormatVeryShort')),
          currentDate: moment().format(__('time.dateFormatVeryShort'))
        }
      })
    } catch (e) {
      console.log('[Consents] failed to fill placeholders, falling back to printing blank form')
      console.error(e)
      base64 = template.base64
    }

    if (base64) {
      console.log('[Consents] printing template via base64')
    } else if (template.localPath) {
      console.log('[Consents] printing template via local path')
    }

    const client = getClient()
    const printer = (client && client.settings && client.settings.print && client.settings.print.printer) || undefined
    const flags = (client && client.settings && client.settings.print && client.settings.print.flags) || undefined

    toNative('print', {
      physical: true,
      title: template.name,
      base64,
      localPath: template.localPath,
      printer,
      flags
    })

    Alert.info(__('ui.printing'))
  }

  const handleScan = () => {
    const mediaTag = MediaTags.findOne({ isConsent: true })
    scan({ mediaTag, patientId, appointmentId })
  }

  const handleSelectPastAppointmentConsent = pastAppointmentId => {
    const pastAppointment = Appointments.findOne({ _id:
      pastAppointmentId })

    if (!pastAppointment) {
      throw new Error(`handleSelectPastAppointmentConsent: Cannot find past appointment with id ${pastAppointmentId}`)
    }

    const consentMediaIds = uniq([
      ...(appointment.consentMediaIds || []),
      ...(pastAppointment.consentMediaIds || [])
    ])

    Appointments.actions.update.callPromise({
      appointmentId,
      update: {
        consentMediaIds
      }
    })

    Alert.success('Revers weiter gültig')
  }

  return <Dialog transitionDuration={0} onClose={onClose} open={open} PaperProps={paperProps}>
    <Close onClick={onClose} />
    <p style={headingStyle}>Revers</p>
    <div style={newConsentStyle}>

      {canPrint &&
        <>
          <div style={pickerStyle}>
            <TemplatePicker
              defaultValue={defaultTemplateId}
              onChange={setTemplateId}
              value={templateId} />
          </div>
          <Button
            onClick={handlePrint}
            style={printButtonStyle}
            variant='outlined'
            color='primary'>Drucken</Button>
        </>
      }
      <Button
        onClick={handleScan}
        style={printButtonStyle}
        variant='outlined'
        color='primary'>Scannen</Button>
    </div>

    <small style={separatorStyle}><span style={separatorInnerStyle}>oder bestehenden Revers wählen</span></small>

    <List>
      {pastAppointmentsWithConsents.map(a =>
        <ListItem
          key={a._id}
          style={pastConsentStyle}>
          <ListItemIcon>
            <Checkbox
              onClick={() => handleSelectPastAppointmentConsent(a._id)}
              checked={Boolean(a.consentMedias && a.consentMedias.some(m => appointment.consentMediaIds && appointment.consentMediaIds.indexOf(m._id) !== -1))}
              disableRipple
              edge='start' />
          </ListItemIcon>

      <span>{moment(a.start).format(__('time.dateFormat'))}</span>
          <TagsList tiny showDuration={false} tags={a.tags} />
          <div style={drawerStyle}>
            {a.consentMedias.map(m =>
              <Preview
                key={m._id}
                media={m}
                handleMediaClick={() => handleMediaClick(m._id)}
              />
            )}
          </div>
        </ListItem>
      )}
    </List>
  </Dialog>
})

const drawerStyle = {
  display: 'flex',
  alignItems: 'flex-end'
}

const paperProps = {
  style: {
    minWidth: 600,
    minHeight: 550
  }
}

const headingStyle = {
  fontSize: '110%',
  width: '100%',
  padding: '20px 20px 0 20px',
  textAlign: 'center'
}

const newConsentStyle = {
  width: '100%',
  display: 'flex',
  padding: 20
}

const pickerStyle = {
  width: '100%'
}

const printButtonStyle = {
  marginLeft: 20,
  width: 100,
  // zoom: 0.9
}

const separatorStyle = {
  display: 'block',
  textAlign: 'center',
  opacity: 0.8,
  margin: 15,
  background: 'linear-gradient(#ffffff 0%, #ffffff 49%, #777 50%, #777 51%, #ffffff 52%, #ffffff 100%)'
}

const separatorInnerStyle = {
  background: 'white',
  padding: '0 20px',
  position: 'relative'
}

const pastConsentStyle = {
  display: 'flex',
  justifyContent: 'space-between'
}
