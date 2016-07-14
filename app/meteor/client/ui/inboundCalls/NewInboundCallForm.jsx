import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { RaisedButton } from 'material-ui'
import { TextField, Checkbox } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'

class NewInboundCallFormComponent extends React.Component {

  componentWillMount () {
    // this.refs.note            // the Field
    //   .getRenderedComponent() // on Field, returns ReduxFormMaterialUITextField
    //   .getRenderedComponent() // on ReduxFormMaterialUITextField, returns TextField
    //   .focus()                // on TextField
  }

  render () {
    return (
      <form onSubmit={this.props.handleSubmit} className="mui" autoComplete="nope">

        <div className="row">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-6">
                <div>
                  <Field name="lastName" component={TextField} fullWidth
                    floatingLabelText={TAPi18n.__('inboundCalls.form.lastName.label')} />
                </div>
                <div>
                  <Field name="firstName" component={TextField} fullWidth
                    floatingLabelText={TAPi18n.__('inboundCalls.form.firstName.label')} />
                </div>
                <div>
                  <Field name="telephone" component={TextField} fullWidth
                    floatingLabelText={TAPi18n.__('inboundCalls.form.telephone.label')} />
                </div>
                <div className="form-row">
                  <Field name="privatePatient" component={Checkbox}
                    label={TAPi18n.__('inboundCalls.form.privatePatient.label')} />
                </div>
              </div>
              <div className="col-md-6">
                <Field name="note"
                  component={TextField}
                  multiLine rows={7} fullWidth
                  floatingLabelText={TAPi18n.__('inboundCalls.form.note.label')} />
              </div>
            </div>
          </div>
        </div>

        <div className="row form-row">
          <div className="col-md-12">
            <RaisedButton type="submit" fullWidth primary>{TAPi18n.__('inboundCalls.thisSave')}</RaisedButton>
          </div>
        </div>

      </form>
    )
  }
}

export const NewInboundCallForm = reduxForm({
  form: 'newInboundCall',
  fields: ['lastName', 'firstName', 'telephone', 'note']
})(NewInboundCallFormComponent)
