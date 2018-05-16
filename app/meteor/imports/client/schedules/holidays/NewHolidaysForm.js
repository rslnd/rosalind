import React from 'react'
import { reduxForm, Field, Fields } from 'redux-form'
import Button from 'material-ui/Button'
import { TextField } from 'redux-form-material-ui'
import { __ } from '../../../i18n'
import { DateRangePicker } from '../../components/form/DateRangePicker'

class NewHolidaysFormComponent extends React.Component {
  render () {
    const { pristine, submitting, handleSubmit, onSubmit } = this.props
    return (
      <form onSubmit={handleSubmit(onSubmit)} className='mui'>
        <div className='row'>
          <div className='col-md-6'>
            <h5>{__('schedules.holidaysDateRange')}</h5>
            <Fields names={['start', 'end']} component={DateRangePicker} />
          </div>
          <div className='col-md-6'>
            <Field name='note'
              component={TextField}
              fullWidth
              label={__('schedules.holidaysNote')} />
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12' style={{ marginTop: 20 }}>
            <Button variant='raised' type='submit'
              onClick={handleSubmit}
              fullWidth
              primary={!submitting && !pristine}
              disabled={pristine || submitting}>
              {__('schedules.holidaysSave')}
            </Button>
          </div>
        </div>
      </form>
    )
  }
}

export const NewHolidaysForm = reduxForm({
  form: 'newHolidays',
  fields: ['start', 'end', 'note'],
  validate: (values) => {
    let errors = {}
    const required = __('ui.required')
    if (!values.start) { errors.start = required }
    if (!values.end) { errors.end = required }
    if (!values.note) { errors.note = required }
    return errors
  }
})(NewHolidaysFormComponent)
