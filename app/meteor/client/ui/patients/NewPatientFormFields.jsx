import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import FlatButton from 'material-ui/FlatButton'
import { Icon } from 'client/ui/components/Icon'

class ToggleField extends React.Component {
  constructor (props) {
    super(props)

    const possibleValues = this.props.values.map((v) => v.value)
    let currentIndex = possibleValues.indexOf(this.props.input.value)
    if (currentIndex === -1) {
      currentIndex = 0
    }

    this.state = { currentIndex }

    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    const newIndex = 1 - this.state.currentIndex

    this.setState({
      currentIndex: newIndex
    })

    this.props.input.onChange(this.props.values[newIndex].value)
  }

  render () {
    return <FlatButton
      onClick={this.toggle}
      style={{ ...this.props.style }}>
      {this.props.values[this.state.currentIndex].label}</FlatButton>
  }
}

export class NewPatientFormFields extends React.Component {
  constructor (props) {
    super(props)

    if (props.lastName) {

    }

    if (props.firstName) {
    }
  }

  render () {
    return (
      <div>
        {/* Name */}
        <div className="row">
          <div className="col-md-12">
            <div className="row no-pad">
              <div className="col-md-1">
                <Field
                  name="gender"
                  component={ToggleField}
                  style={{ minWidth: 31, marginTop: 32 }}
                  values={[
                    { value: 'Female', label: TAPi18n.__('patients.salutationFemale') },
                    { value: 'Male', label: TAPi18n.__('patients.salutationMale') }
                  ]} />
              </div>
              <div className="col-md-5">
                <div>
                  <Field
                    name="lastName"
                    component={TextField}
                    fullWidth
                    floatingLabelText={TAPi18n.__('inboundCalls.form.lastName.label')} />
                </div>
              </div>
              <div className="col-md-5">
                <div>
                  <Field
                    name="firstName"
                    component={TextField}
                    fullWidth
                    autoFocus={() => console.log(this.props)}
                    floatingLabelText={TAPi18n.__('inboundCalls.form.firstName.label')} />
                </div>
              </div>
              <div className="col-md-1">
                <FlatButton
                  style={{ minWidth: 31, marginTop: 32, color: '#bebebe' }}
                  onClick={this.props.swapNameFields}>
                  <Icon name="random" flipHorizontal />
                </FlatButton>
              </div>
            </div>

            {/* Birthday */}
            <div className="row">
              <div className="col-md-12">
                <div className="row no-pad">
                  <div className="col-md-1">
                    <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                      <Icon name="birthday-cake" />
                    </div>
                  </div>
                  <div className="col-md-10">
                    <div>
                      <Field name="birthday" component={TextField} fullWidth
                        floatingLabelText={TAPi18n.__('patients.birthday')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="row">
              <div className="col-md-12">
                <div className="row no-pad">
                  <div className="col-md-1">
                    <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                      <Icon name="phone" />
                    </div>
                  </div>
                  <div className="col-md-10">
                    <div>
                      <Field name="telephone" component={TextField} fullWidth
                        floatingLabelText={TAPi18n.__('inboundCalls.form.telephone.label')} />
                    </div>
                  </div>
                </div>
              </div>

              {/* <div>
                <Field name="note"
                  component={TextField}
                  autoFocus
                  multiLine rows={1} fullWidth
                  floatingLabelText={TAPi18n.__('inboundCalls.form.note.label')} />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
