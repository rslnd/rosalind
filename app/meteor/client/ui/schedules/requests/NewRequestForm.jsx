import React from 'react'
import { reduxForm } from 'redux-form/immutable'
import { Field, Fields } from 'redux-form'
import { RaisedButton } from 'material-ui'
import { TextField, RadioButtonGroup } from 'redux-form-material-ui'
import RadioButton from 'material-ui/RadioButton'
import { TAPi18n } from 'meteor/tap:i18n'
import { DateRangePicker } from 'client/ui/components/DateRangePicker'

class NewRequestFormComponent extends React.Component {
  render () {
    const { pristine, submitting, handleSubmit, onSubmit } = this.props
    return (
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="mui">
        <h5>Zeitraum</h5>
        <Fields names={['start', 'end']} component={DateRangePicker} />

        <div className="row">
          <div className="col-md-6">
            <h5>Ansuchen auf</h5>
            <Field name="reason" component={RadioButtonGroup}>
              <RadioButton value="vacation" label={TAPi18n.__('schedules.requests.vacation')} />
              <RadioButton value="compensatory" label={TAPi18n.__('schedules.requests.compensatory')} />
              <RadioButton value="sick" label={TAPi18n.__('schedules.requests.sick')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field name="note"
              component={TextField}
              multiLine rows={1} fullWidth
              floatingLabelText={TAPi18n.__('schedules.note')} />
          </div>
        </div>

        <RaisedButton type="submit"
          onClick={handleSubmit}
          fullWidth
          primary={!submitting && !pristine}
          disabled={pristine || submitting}>
          {TAPi18n.__('schedules.postRequest')}
        </RaisedButton>
      </form>
    )
  }
}

export const NewRequestForm = reduxForm({
  form: 'newSchedulesRequest',
  fields: ['start', 'end', 'note', 'reason'],
  initialValues: {
    start: new Date(),
    end: new Date()
  },
  validate: (values) => {
    let errors = {}
    if (!values.reason) { errors.reason = 'Erforderlich' }
    return errors
  }
})(NewRequestFormComponent)
