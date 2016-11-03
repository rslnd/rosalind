import React from 'react'
import moment from 'moment'
import { reduxForm, Field } from 'redux-form'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { TagsField } from 'client/ui/tags/TagsField'
import { PatientPickerContainer } from 'client/ui/patients/PatientPickerContainer'
import { UserHelper } from 'client/ui/users/UserHelper'
import style from './style'

const summary = ({ time, assigneeId }) => (
  <div className={style.summary}>
    <span className="text-muted">{TAPi18n.__('appointments.thisSingular')}</span>&nbsp;
    {moment(time).format(TAPi18n.__('time.dateFormatWeekday'))}<br />

    <span className="text-muted">{TAPi18n.__('time.at')}</span>&nbsp;
    <b>{moment(time).format(TAPi18n.__('time.timeFormat'))}</b><br />

    {
      assigneeId && <div>
        <span className="text-muted">{TAPi18n.__('appointments.assignedTo')}</span>&nbsp;
        <UserHelper helper="fullNameWithTitle" userId={assigneeId} /><br />
      </div>
    }
  </div>
)

export class NewAppointmentFormComponent extends React.Component {
  render () {
    const { time, assigneeId, pristine, submitting, handleSubmit, onSubmit } = this.props

    return (
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className={style.padded}>
          <div className="container-fluid">
            <div className="row">
              <Field
                name="patientId"
                component={PatientPickerContainer}
                autofocus />
            </div>
          </div>
        </div>
        <Divider />
        <div className={style.padded}>
          <div className="container-fluid">

          {/* Tags and Note */}
            <div className="row" style={{ marginTop: -25 }}>
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-12">
                    <div className="row">
                      <div className="col-md-6" style={{ marginTop: 30, paddingLeft: 0, paddingRight: 0 }}>
                        <Field
                          name="tags"
                          component={TagsField}
                          fullWidth />
                      </div>
                      <div className="col-md-6">
                        <div>
                          <Field name="appointmentNote"
                            component={TextField}
                            multiLine rows={1} fullWidth
                            floatingLabelText={TAPi18n.__('appointments.form.note.label')} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {summary({ time, assigneeId })}
            </div>
            <div className="row">
              <RaisedButton type="submit"
                onClick={this.handleSubmit}
                fullWidth
                primary={!submitting && !pristine}
                disabled={pristine || submitting}
                label={TAPi18n.__('appointments.thisSave')} />
            </div>
          </div>
        </div>
      </form>
    )
  }
}

export const NewAppointment = reduxForm({
  form: 'newAppointment',
  fields: ['note', 'patientId', 'tags', 'appointmentNote',
    // The following fields may be filled within NewPatientFormFields
    // This allows creating a new patient at the same time as an appointment
    'firstName', 'lastName', 'gender', 'telephone', 'email', 'birthday', 'patientNote'],
  validate: () => { return {} }
})(NewAppointmentFormComponent)
