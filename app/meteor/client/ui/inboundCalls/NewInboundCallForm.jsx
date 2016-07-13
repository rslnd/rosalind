import React from 'react'
import { reduxForm } from 'redux-form'
import { FormGroup, ControlLabel, FormControl, Checkbox, Button } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'

const form = {

}


const fields = {
  firstName: {
    type: 'text',
    label: TAPi18n.__('inboundCalls.form.firstName.label')
  },
  lastName: {
    type: 'text',
    label: TAPi18n.__('inboundCalls.form.lastName.label')
  },
  telephone: {
    type: 'text',
    label: TAPi18n.__('inboundCalls.form.telephone.label')
  },
  note: {
    type: 'textarea',
    label: TAPi18n.__('inboundCalls.form.note.label'),
    rows: 6
  }
}

class NewInboundCallFormComponent extends React.Component {

  renderField (fieldConfig, fieldName) {
    const field = this.props.fields[fieldName]

    return (
      <FormGroup controlId={fieldName}>
        <ControlLabel>{fieldConfig.label}</ControlLabel>
        {fieldConfig.type === 'text' && <FormControl type="text" {...field} {...fieldConfig} />}
        {fieldConfig.type === 'textarea' && <FormControl componentClass="textarea" {...field} {...fieldConfig} />}
      </FormGroup>
    )
  }

  render () {
    const { fields: { privatePatient }, handleSubmit } = this.props

    return (
      <form onSubmit={handleSubmit}>
        {this.renderField(fields.lastName, 'lastName')}
        {this.renderField(fields.firstName, 'firstName')}
        {this.renderField(fields.telephone, 'telephone')}
        {this.renderField(fields.note, 'note')}

        <FormGroup controlId="privatePatient">
          <ControlLabel>
            <Checkbox {...privatePatient}>
            Private Patient
            </Checkbox>
          </ControlLabel>
        </FormGroup>

        <Button type="submit" bsStyle="primary">{TAPi18n.__('inboundCalls.thisSave')}</Button>
      </form>
    )
  }
}

export const NewInboundCallForm = reduxForm({
  form: 'newInboundCall',
  fields: Object.keys(fields)
})(NewInboundCallFormComponent)
