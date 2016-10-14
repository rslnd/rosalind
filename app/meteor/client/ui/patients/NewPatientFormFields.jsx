import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'

export class NewPatientFormFields extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-6">
                <div>
                  <Field name="lastName" component={TextField} fullWidth
                    floatingLabelText={TAPi18n.__('inboundCalls.form.lastName.label')} />
                </div>
                <div>
                  <Field name="telephone" component={TextField} fullWidth
                    floatingLabelText={TAPi18n.__('inboundCalls.form.telephone.label')} />
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <Field name="firstName" component={TextField} fullWidth
                    floatingLabelText={TAPi18n.__('inboundCalls.form.firstName.label')} />
                </div>

                <Field name="note"
                  component={TextField}
                  autoFocus
                  multiLine rows={1} fullWidth
                  floatingLabelText={TAPi18n.__('inboundCalls.form.note.label')} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
