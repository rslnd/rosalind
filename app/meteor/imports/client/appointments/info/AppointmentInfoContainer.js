import React from 'react'
import { connect } from 'react-redux'
import { touch, reduxForm, formValueSelector } from 'redux-form'
import { compose, branch } from 'recompose'
import Alert from 'react-s-alert'
import sum from 'lodash/sum'
import isEqual from 'lodash/isEqual'
import identity from 'lodash/identity'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../../i18n'
import { withTracker } from '../../components/withTracker'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { Users } from '../../../api/users'
import { Comments } from '../../../api/comments'
import { Constraints } from '../../../api/constraints'
import { findConstraint } from '../../../api/constraints/methods/findConstraint'
import { Calendars } from '../../../api/calendars'
import { subscribe } from '../../../util/meteor/subscribe'
import { AppointmentInfoMinimal } from './AppointmentInfoMinimal'
import { AppointmentInfo } from './AppointmentInfo'
import { calculateRevenue } from '../new/RevenueField'
import { translateObject } from '../../components/form/translateObject'
import { mapPatientToFields } from '../../patients/mapPatientToFields'
import { mapFieldsToPatient } from '../../patients/mapFieldsToPatient'
import { validate } from '../new/newAppointmentValidators'
import { hasRole } from '../../../util/meteor/hasRole';

export const formName = 'appointmentInfoForm'

const composer = props => {
  const { appointmentId } = props
  const subscription = appointmentId && subscribe('appointment', { appointmentId: props.appointmentId })

  const appointment = props.appointmentId && Appointments.findOne({ _id: props.appointmentId })

  const isLoading = appointment && appointment.patientId && subscription && !subscription.ready()

  let { patientId, assigneeId, calendarId } = (appointment || {})

  if (!patientId) {
    patientId = props.patientId
  }

  const canRefer = hasRole(Meteor.userId(), ['referrals'])
  patientId && subscribe('patients', { patientIds: [patientId] })
  patientId && canRefer && subscribe('referrals', {
    patientIds: [ patientId ]
  })

  const patient = patientId && Patients.findOne({ _id: patientId })

  if (appointment || patient) {
    const assignee = Users.findOne({ _id: assigneeId })
    const comments = patient ? Comments.find({
      docId: patient._id
    }, {
      sort: { createdAt: 1 }
    }).fetch() : []
    const calendar = calendarId && Calendars.findOne({ _id: calendarId })

    const initialPatientFields = mapPatientToFields(patient)
    const initialAppointmentFields = {
      tags: appointment && appointment.tags,
      revenue: appointment && appointment.revenue,
      note: appointment && appointment.note
    }
    const initialValues = {
      appointment: initialAppointmentFields,
      patient: initialPatientFields
    }

    const allowedTags = appointment && Appointments.methods.getAllowedTags({ time: appointment.start, calendarId, assigneeId })
    const maxDuration = appointment && Appointments.methods.getMaxDuration({ time: appointment.start, calendarId, assigneeId })

    // TODO: Move into action
    let totalPatientRevenue = null
    if (patient) {
      const pastAppointments = Appointments.find({
        patientId: patient._id
      }).fetch()

      totalPatientRevenue = (patient.externalRevenue || 0) +
        sum(pastAppointments.map(p => p.revenue).filter(identity))
    }

    const handleEditPatient = v => {
      if (patient && !isEqual(initialPatientFields, v.patient)) {
        const patient = mapFieldsToPatient(v.patient)

        return Patients.actions.upsert.callPromise({
          patient: {
            ...patient,
            _id: patient._id
          },
          replaceContacts: true
        })
        .then(() => Alert.success(__('patients.editSuccess')))
        .catch(e => {
          Alert.error('Bitte noch einmal versuchen')
          console.error(e)
        })
      }
    }

    const handleEditAppointment = v => {
      if (appointment && !isEqual(initialAppointmentFields, v.appointment)) {
        return Appointments.actions.update.callPromise({
          appointmentId: appointment._id,
          update: v.appointment
        })
        .then(() => Alert.success(__('appointments.editSuccess')))
        .catch(e => {
          Alert.error('Bitte noch einmal versuchen')
          console.error(e)
        })
      }
    }

    const handleToggleGender = () => {
      patient && Patients.actions.toggleGender.callPromise({
        patientId: patient._id
      }).then(() => {
        Alert.success(__('patients.editSuccess'))
      })
    }

    const handleSetMessagePreferences = (newValue) => {
      const noSMS = !newValue.value

      if (patient) {
        if (noSMS) {
          Alert.success(__('patients.messagesDisabledSuccess'))
        } else {
          Alert.success(__('patients.messagesEnabledSuccess'))
        }

        Patients.actions.setMessagePreferences.call({
          patientId: patient._id,
          noSMS
        })
      }
    }

    const constraint = appointment && assignee && findConstraint(Constraints)({
      calendarId,
      assigneeId: assignee._id,
      time: appointment.start
    })

    return {
      ...props,
      isLoading,
      initialValues,
      calendar,
      appointment,
      patient,
      assignee,
      comments,
      allowedTags,
      maxDuration,
      canRefer,
      totalPatientRevenue,
      handleEditPatient,
      handleEditAppointment,
      handleToggleGender,
      handleSetMessagePreferences,
      constraint
    }
  } else {
    return
  }
}

const InfoComponent = ({ minimal, ...p }) =>
  minimal
  ? <AppointmentInfoMinimal {...p} />
  : <AppointmentInfo {...p} />

export const AppointmentInfoContainer = compose(
  withTracker(composer),
  reduxForm({
    form: formName,
    enableReinitialize: true,
    updateUnregisteredFields: true,
    keepDirtyOnReinitialize: false,
    pure: false,
    warn: (values) => translateObject(validate(values))
  })
)(InfoComponent)
