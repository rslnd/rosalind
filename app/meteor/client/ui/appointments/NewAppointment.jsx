import React from 'react'
import { reduxForm } from 'redux-form/immutable'
import { Field } from 'redux-form'
import RaisedButton from 'material-ui/RaisedButton'
import { TextField } from 'redux-form-material-ui'
import sst from 'meteor-simple-schema-transform'
import { TAPi18n } from 'meteor/tap:i18n'
import schema from 'api/appointments/schema'
import { PatientPickerContainer } from 'client/ui/patients/PatientPickerContainer'
import style from './style'

export class NewAppointmentFormComponent extends React.Component {
  render () {
    const { pristine, submitting, handleSubmit, onSubmit } = this.props

    return (
      <form onSubmit={handleSubmit(onSubmit)} className={style.form} autoComplete="off">
        <div className="container-fluid">
          <div className="row">
            <Field
              name="patientId"
              component={PatientPickerContainer}
              autofocus />
          </div>
          <div className="row">
            <Field
              name="note"
              component={TextField}
              multiLine rows={1} fullWidth
              floatingLabelText={TAPi18n.__('appointments.form.note.label')} />
          </div>
          <div className="row">
            <RaisedButton type="submit"
              onClick={this.handleSubmit}
              fullWidth
              primary={!submitting && !pristine}
              disabled={pristine || submitting}>
              {TAPi18n.__('appointments.thisSave')}
            </RaisedButton>
          </div>
        </div>
      </form>
    )
  }
}

export const NewAppointment = reduxForm({
  form: 'newAppointment',
  fields: ['note'],
  validate: (data) => {
    return true
  }
})(NewAppointmentFormComponent)
