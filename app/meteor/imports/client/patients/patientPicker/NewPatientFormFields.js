import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import FlatButton from 'material-ui/FlatButton'
import { Icon } from '../../components/Icon'
import { ToggleField } from '../../components/form/ToggleField'
import { BirthdayField } from '../../components/form/BirthdayField'
import { NewPatientExtendedFormFields } from './NewPatientExtendedFormFields'

export class NewPatientFormFields extends React.Component {
  render () {
    const { whitelistFields, extended } = this.props

    if (extended) {
      return <NewPatientExtendedFormFields />
    }

    const shouldShowField = field =>
      whitelistFields ? whitelistFields.includes(field) : true

    const name = shouldShowField('name')
    const birthday = shouldShowField('birthday')
    const phone = shouldShowField('phone')
    const email = shouldShowField('email')

    return (
      <div>
        <div className='row'>
          <div className='col-md-12'>
            {
              name &&
                <div className='row no-pad' style={{ marginTop: -10, zIndex: 19 }}>
                  <div className='col-md-1'>
                    <div style={{ textAlign: 'center' }}>
                      <Field
                        name='gender'
                        component={ToggleField}
                        style={{ minWidth: 31, marginTop: 32 }}
                        values={[
                          { value: 'Female', label: TAPi18n.__('patients.salutationFemale') },
                          { value: 'Male', label: TAPi18n.__('patients.salutationMale') }
                        ]} />
                    </div>
                  </div>
                  <div className='col-md-5'>
                    <div>
                      <Field
                        name='lastName'
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__('inboundCalls.form.lastName.label')} />
                    </div>
                  </div>
                  <div className='col-md-5'>
                    <div>
                      <Field
                        name='firstName'
                        component={TextField}
                        fullWidth
                        autoFocus
                        floatingLabelText={TAPi18n.__('inboundCalls.form.firstName.label')} />
                    </div>
                  </div>
                </div>
            }

            {
              birthday &&
                <div className='row'>
                  <div className='col-md-12'>
                    <div className='row no-pad' style={{ minWidth: 31, marginTop: -15, textAlign: 'center', zIndex: 18 }}>
                      <div className='col-md-1'>
                        <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                          <Icon name='birthday-cake' />
                        </div>
                      </div>
                      <div className='col-md-10'>
                        <div>
                          <Field
                            name='birthday'
                            component={BirthdayField}
                            fullWidth
                            floatingLabelText={TAPi18n.__('patients.birthday')} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            }

            {
              phone &&
                <div className='row'>
                  <div className='col-md-12'>
                    <div className='row no-pad' style={{ marginTop: -15, zIndex: 17 }}>
                      <div className='col-md-1'>
                        <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                          <Icon name='phone' />
                        </div>
                      </div>
                      <div className='col-md-10'>
                        <div>
                          <Field
                            name='telephone'
                            component={TextField}
                            fullWidth
                            floatingLabelText={TAPi18n.__('inboundCalls.form.telephone.label')} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            }

            {
              email &&
                <div className='row'>
                  <div className='col-md-12'>
                    <div className='row no-pad' style={{ marginTop: -15, zIndex: 17 }}>
                      <div className='col-md-1'>
                        <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                          <Icon name='envelope-o' />
                        </div>
                      </div>
                      <div className='col-md-10'>
                        <div>
                          <Field
                            name='email'
                            component={TextField}
                            fullWidth
                            floatingLabelText={TAPi18n.__('patients.email')} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            }

          </div>
        </div>
      </div>
    )
  }
}
