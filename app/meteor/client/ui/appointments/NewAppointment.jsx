import React from 'react'
import moment from 'moment'
import { reduxForm } from 'redux-form/immutable'
import { Field } from 'redux-form'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { PatientPickerContainer } from 'client/ui/patients/PatientPickerContainer'
import { UserHelper } from 'client/ui/users/UserHelper'
import style from './style'

const summary = ({ time, assigneeId }) => (
  <div className={style.summary}>
    <span className="text-muted">Termin</span>&nbsp;
    {moment(time).format(TAPi18n.__('time.dateFormatWeekday'))}<br />

    <span className="text-muted">um</span>&nbsp;
    <b>{moment(time).format(TAPi18n.__('time.timeFormat'))}</b><br />

    <span className="text-muted">bei</span>&nbsp;
    <UserHelper helper="fullNameWithTitle" userId={assigneeId} /><br />
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
            <div className="row" style={{ marginTop: '-25px' }}>
              <Field
                name="note"
                component={TextField}
                multiLine rows={1} fullWidth
                floatingLabelText={TAPi18n.__('appointments.form.note.label')} />
            </div>
            <div className="row">
              {summary({ time, assigneeId })}
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
