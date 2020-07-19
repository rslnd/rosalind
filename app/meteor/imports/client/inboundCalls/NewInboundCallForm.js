import React from 'react'
import { reduxForm, Field } from 'redux-form'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { Checkbox } from '../components/form/Checkbox'
import { TextField } from '../components/form/TextField'
import { TopicPicker } from './TopicPicker'
import { __ } from '../../i18n'

class NewInboundCallFormComponent extends React.Component {
  render () {
    const { invalid, pristine, submitting, handleSubmit, onSubmit, canPin } = this.props

    return (
      <form onSubmit={handleSubmit(onSubmit)} className='mui' autoComplete='off'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='row'>
              <div className='col-md-6'>
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
                  multiline rows={7} fullWidth
                  label={__('inboundCalls.form.note.label')} />
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
    )
  }
}

export const NewInboundCallForm = reduxForm({
  form: 'newInboundCall',
  fields: ['lastName', 'firstName', 'telephone', 'note', 'topicId', 'pinnedBy'],
  validate: ({ lastName, note }) => {
    let errors = {}
    if (!lastName) {
      errors.lastName = __('ui.required')
    }

    if (!note) {
      errors.note = __('ui.required')
    }
    return errors
  }
})(NewInboundCallFormComponent)
