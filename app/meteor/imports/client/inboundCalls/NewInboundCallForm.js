import idx from 'idx'
import React, { useState, useRef } from 'react'
import { reduxForm, FormSection, Field, formValueSelector } from 'redux-form'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { Checkbox } from '../components/form/Checkbox'
import { TextField } from '../components/form/TextField'
import { TopicPicker } from './TopicPicker'
import { PatientPickerField } from '../patients/picker'
import { __ } from '../../i18n'
import { hasRole } from '../../util/meteor/hasRole'
import { RadioField } from '../components/form/RadioField'
import { compose, mapProps } from 'recompose'
import { connect } from 'react-redux'
import { PatientsAppointmentsContainer } from '../patientAppointments/PatientsAppointmentsContainer'
import { safeMediaTypes } from '../../util/schema'

const maxBytes = 3000000
const FileField = ({ input, meta }, x) => {
  const ref = useRef()
  const [error, setError] = useState(null)

  return  <div>
    <input
      type='file'
      ref={ref}
      id="filepicker" // to reset after submit in container
      onChange={e => {
        const file = e.currentTarget.files[0]
        console.log('FileField', file)
        const fail = ( message) => {
          console.log('FileField fail', message)
          setError(message)
          input.onChange(null)
          ref.current.value = ""
        }
        if (!file) {
          input.onChange(null)
          ref.current.value = ""
          setError(null)
        } else {
          if (!safeMediaTypes.includes(file.type)) {
            fail(__("ui.mediaTypeNotAllowed"))
            return
          }

          if (file.size > maxBytes) {
            fail(__("ui.fileTooLarge", {maxMB: Math.ceil(maxBytes / 1000000)}))
            return
          }

          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => {
            setError(null)
            input.onChange({
              b64: reader.result,
              name: file.name,
              size: file.size,
              mediaType: file.type
            })
          }
          reader.onerror = (error) => {
            fail(error.message)
            throw error
          }
        }
      }}
    />
    {error}
  </div>
}

export const formName = 'newInboundCall'

const NewInboundCallFormComponent = (props) => {
  const [modalPatientId, setModalPatientId] = useState(null)
  const { kind, patient, invalid, pristine, submitting, handleSubmit, onSubmit, canPin } = props

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className='mui' autoComplete='off'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='row'>
              <div className='col-md-6'>
                <div>
                  <Field
                    name='kind'
                    component={RadioField}
                    horizontal
                    options={[
                      {
                        label:'PatientIn',
                        value:'patient',
                        title:'Neue und bereits bestehende PatientInnen'
                      },
                      { 
                        label:'andere',
                        value:'other',
                        title:'Unternehmen, Apotheken, Einrichtungen, etc.'
                      }
                    ]}
                  />
                </div>

                {
                  kind === 'patient' &&
                    <div>
                      <FormSection name='patient'>
                        <PatientPickerField
                          withAppointments
                          onPatientModalOpen={setModalPatientId}
                          formName={formName}
                          upsert
                          nameEditable={patient && patient.patientId === 'newPatient'}
                          extended={false}
                          bannedIndicator={hasRole(Meteor.userId(), ['admin', 'patients-ban'])}
                        />
                      </FormSection>
                    </div>
                }

                {
                  kind === 'other' &&
                    <>
                      <div>
                        <Field name='lastName' component={TextField} fullWidth
                          label={__('inboundCalls.form.lastName.label')} />
                      </div>
                      <div>
                        <Field name='firstName' component={TextField} fullWidth
                          label={__('inboundCalls.form.firstName.label')} />
                      </div>
                      <div>
                        <Field name='telephone' component={TextField} fullWidth
                          label={__('inboundCalls.form.telephone.label')} />
                      </div>
                    </>
                }

                <div className='form-row'>
                  <Field name='topicId' component={TopicPicker} />
                </div>
                {
                  canPin && <div className='form-row'>
                    <FormControlLabel
                      control={
                        <Field
                          name='pinnedBy'
                          component={Checkbox}
                        />
                      }
                      label={__('inboundCalls.pin')}
                    />
                  </div>
                }
              </div>
              <div className='col-md-6'>
                <Field name='note'
                  component={TextField}
                  autoFocus
                  multiline
                  rows={7}
                  rowsMax={16}
                  fullWidth
                  label={__('inboundCalls.form.note.label')} />

                {
                  hasRole(Meteor.userId(), ['inboundCalls-attachment', 'admin']) &&
                    <Field name='attachment'
                      component={FileField}
                    />
                }
              </div>
            </div>
          </div>
        </div>

        <div className='row form-row'>
          <div className='col-md-12'>
            <Button variant='contained' type='submit'
              fullWidth
              color={(!submitting && !pristine) ? 'primary' : 'default'}
              disabled={invalid || pristine || submitting}>
              {__('inboundCalls.thisSave')}
            </Button>
          </div>
        </div>
      </form>
      <PatientsAppointmentsContainer
        show={Boolean(modalPatientId)}
        onClose={() => setModalPatientId(null)}
        patientId={modalPatientId}
        viewInCalendar
      />
    </>
  )
}

const selector = formValueSelector(formName)

export const NewInboundCallForm = compose(
  connect(state => ({
    patient: idx(state, _ => _.patientPicker.patient)
  })),
  mapProps(props => {
    return {
      ...props,
      initialValues: {
        patient: props.patient ? {
          ...(props.patient || {}),
          patientId: props.patient._id || props.patient.patientId
        } : undefined,
        kind: 'patient',
        topicId: null
      }
    }
  }),
  reduxForm({
    form: formName,
    fields: [
      'patient', // for linking with patients
      // ...and keep these plain fields for linking with suppliers and internal comms:
      'lastName', 'firstName', 'telephone', 'note', 'topicId', 'pinnedBy',
      'attachment'
    ],
    initialValues: {
      topicId: null,
      kind: 'patient'
    },
    validate: ({ note }) => {
      let errors = {}

      if (!note) {
        errors.note = __('ui.required')
      }
      return errors
    }
  }),
  connect((state, props) => {
    return {
      kind: selector(state, 'kind'),
      patient: selector(state, 'patient')
    }
  })
)(NewInboundCallFormComponent)
