import React from 'react'
import moment from 'moment-timezone'
import { reduxForm, Field } from 'redux-form'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { TagsField } from '../../tags/TagsField'
import { PatientPickerContainer } from '../../patients/patientPicker/PatientPickerContainer'
import { UserHelper } from '../../users/UserHelper'
import { validate } from './newAppointmentValidators'

const style = {
  padded: {
    padding: 10
  },
  tagsRow: {
    marginTop: -25
  },
  tagsField: {
    marginTop: 30,
    paddingLeft: 0,
    paddingRight: 0
  },
  noteRow: {
    marginTop: -40
  },
  noteField: {
    marginTop: 0,
    paddingLeft: 0,
    paddingRight: 0
  },
  summary: {
    marginBottom: 5
  }
}


const summary = ({ time, assigneeId }) => (
  <div style={style.summary}>
    <span className='text-muted'>{TAPi18n.__('appointments.thisSingular')}</span>&nbsp;
    {moment(time).format(TAPi18n.__('time.dateFormatWeekday'))}<br />

    <span className='text-muted'>{TAPi18n.__('time.at')}</span>&nbsp;
    <b>{moment(time).format(TAPi18n.__('time.timeFormat'))}</b><br />

    {
      assigneeId && <div>
        <span className='text-muted'>{TAPi18n.__('appointments.assignedTo')}</span>&nbsp;
        <UserHelper helper='fullNameWithTitle' userId={assigneeId} /><br />
      </div>
    }
  </div>
)

export class NewAppointmentFormComponent extends React.Component {
  render () {
    const { time, assigneeId, pristine, submitting, handleSubmit, onSubmit, fields } = this.props

    return (
      <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
        <div style={style.padded}>
          <div className='container-fluid'>
            <div className='row'>
              <Field
                name='patientId'
                component={PatientPickerContainer}
                autofocus />
            </div>
          </div>
        </div>
        <Divider />
        <div style={style.padded}>
          <div className='container-fluid'>

            {/* Tags */}
            <div className='row' style={style.tagsRow}>
              <div className='col-md-12' style={style.tagsField}>
                <Field
                  name='tags'
                  component={TagsField}
                  allowedTags={this.props.allowedTags}
                  fullWidth />
              </div>
            </div>

            {/* Note */}
            <div className='row' style={style.noteRow}>
              <div className='col-md-12' style={style.noteField}>
                <Field name='appointmentNote'
                  component={TextField}
                  multiLine rows={1} fullWidth
                  floatingLabelText={TAPi18n.__('appointments.form.note.label')} />
              </div>
            </div>

            <div className='row'>
              {summary({ time, assigneeId })}
            </div>
            <div className='row'>
              <RaisedButton type='submit'
                onClick={this.handleSubmit}
                fullWidth
                primary
                disabled={submitting || (pristine && !this.props.initialValues.patientId)}
                label={TAPi18n.__('appointments.thisSave')} />
            </div>
          </div>
        </div>
      </form>
    )
  }
}

export const translateObject = (obj) => {
  let translated = {}
  Object.keys(obj).map((key) => {
    translated[key] = TAPi18n.__(obj[key])
  })
  return translated
}

export const NewAppointment = reduxForm({
  form: 'newAppointment',
  fields: ['note', 'patientId', 'tags', 'appointmentNote',
    // The following fields may be filled within NewPatientFormFields
    // This allows creating a new patient at the same time as an appointment
    'firstName', 'lastName', 'gender', 'telephone', 'email', 'birthday', 'patientNote'],
  validate: (values) => translateObject(validate(values))
})(NewAppointmentFormComponent)
