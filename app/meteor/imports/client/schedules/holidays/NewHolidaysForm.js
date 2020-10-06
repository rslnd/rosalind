import { Button } from '@material-ui/core'
import React from 'react'
import { reduxForm, Fields } from 'redux-form'
import { __ } from '../../../i18n'
import { DayNoteField } from '../../components/form/DayNoteField'

class NewHolidaysFormComponent extends React.Component {
  generatePlaceholder () {
    return `1.1.${(new Date()).getFullYear() + 1} Neujahr`
  }

  render () {
    const { handleSubmit, onSubmit } = this.props

    return (
      <form onSubmit={handleSubmit(onSubmit)} className='mui'>
        <div style={flexStyle}>
          <Fields
            names={['day', 'note']}
            component={DayNoteField}
            autoComplete='off'
            linesMax={20}
            placeholder={this.generatePlaceholder()}
          />
        </div>
        <Button onClick={handleSubmit(onSubmit)}>
          {__('ui.save')}
        </Button>
      </form>
    )
  }
}

const flexStyle = {
  display: 'flex'
}

export const NewHolidaysForm = reduxForm({
  form: 'newHoliday',
  fields: ['day', 'note'],
  validate: (values) => {
    let errors = {}
    const required = __('ui.required')
    if (!values.day) { errors.day = required }
    if (!values.note) { errors.note = required }
    return errors
  }
})(NewHolidaysFormComponent)
