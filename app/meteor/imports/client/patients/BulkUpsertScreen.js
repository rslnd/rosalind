import React from 'react'
import { Field } from 'redux-form'
import RaisedButton from 'material-ui/RaisedButton'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../components/Icon'
import { Box } from '../components/Box'
import { Currency } from '../components/Currency'
import { PatientPickerUpsert } from './PatientPickerUpsert'
import { DayField } from '../components/form/DayField'
import { CalculatorField } from '../components/form/CalculatorField'
import { twoPlaces } from '../../util/format'

const currencyStyle = {
  fontSize: '20px',
  paddingTop: 35,
  textAlign: 'center',
  width: '100%',
  display: 'inline-block'
}

const CurrencyField = ({ input }) =>
  <Currency
    value={input.value}
    style={currencyStyle} />

export const BulkUpsertScreen = ({ submitting, handleSubmit, onSubmit, patientId, change }) => (
  <div className='content'>
    <Box title='Stammdaten vervollständigen'>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
        <PatientPickerUpsert
          autoFocus
          patientId={patientId}
          extended
          change={change} />

        {
          patientId &&
            <div>
              <div className='row'>
                <div className='col-md-12'>
                  <div className='row no-pad' style={{ marginTop: -15, zIndex: 13 }}>
                    <div className='col-md-1'>
                      <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                        <Icon name='eur' />
                      </div>
                    </div>
                    <div className='col-md-8'>
                      <div>
                        <Field
                          name='externalRevenue'
                          component={CalculatorField}
                          formatter={twoPlaces}
                          fullWidth
                          hintStyle={{ color: '#ccc' }}
                          hintText='100 50 140 ...'
                          floatingLabelText={TAPi18n.__('patients.revenue')} />
                      </div>
                    </div>
                    <div className='col-md-2'>
                      <Field
                        name='externalRevenue'
                        component={CurrencyField} />
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-12'>
                  <div className='row no-pad' style={{ marginTop: -15, zIndex: 13 }}>
                    <div className='col-md-1'>
                      <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                        <Icon name='calendar-o' />
                      </div>
                    </div>
                    <div className='col-md-10'>
                      <div>
                        <Field
                          name='patientSince'
                          component={DayField}
                          fullWidth
                          floatingLabelText={TAPi18n.__('patients.patientSince')} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        }

        <div className='row' style={{ marginTop: 10 }}>
          <div className='col-md-12'>
            <RaisedButton type='submit'
              onClick={handleSubmit(onSubmit)}
              fullWidth
              primary
              disabled={!patientId}
              label={submitting
                ? <Icon name='refresh' spin />
                : TAPi18n.__('patients.thisSave')} />
          </div>
        </div>
      </form>
    </Box>
  </div>
)
