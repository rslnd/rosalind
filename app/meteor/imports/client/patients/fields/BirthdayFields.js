import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
import { DayField } from '../../components/form/DayField'

export const BirthdayFields = ({ collectInsuranceId }) =>
  <div className='row'>
    <div className='col-md-12'>
      <div className='row no-pad' style={{ minWidth: 31, marginTop: -15, textAlign: 'center', zIndex: 17 }} >
        <div className='col-md-1'>
          <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
            <Icon name={collectInsuranceId ? 'id-card-o' : 'birthday-cake'} />
          </div>
        </div>
        {
          collectInsuranceId &&
          <div className='col-md-3'>
            <div>
              <Field
                name='insuranceId'
                component={TextField}
                fullWidth
                floatingLabelText={TAPi18n.__('patients.insuranceId')} />
            </div>
          </div>
        }
        <div className={collectInsuranceId ? 'col-md-7' : 'col-md-10'}>
          <div>
            <Field
              name='birthday'
              component={DayField}
              birthday
              fullWidth
              floatingLabelText={TAPi18n.__('patients.birthday')} />
          </div>
        </div>
      </div>
    </div>
  </div>
