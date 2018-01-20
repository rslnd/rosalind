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
import { rowStyle, iconStyle, grow, shrink } from '../components/form/rowStyle'

const currencyStyle = {
  fontSize: '20px',
  paddingTop: 35,
  paddingLeft: 20,
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
              <div style={rowStyle}>
                <div style={iconStyle}>
                  <Icon name='eur' />
                </div>
                <div style={grow}>
                  <Field
                    name='externalRevenue'
                    component={CalculatorField}
                    formatter={twoPlaces}
                    fullWidth
                    hintStyle={{ color: '#ccc' }}
                    hintText='100 50 140 ...'
                    floatingLabelText={TAPi18n.__('patients.revenue')} />
                </div>
                <div style={shrink}>
                  <Field
                    name='externalRevenue'
                    component={CurrencyField} />
                </div>
              </div>
              <div style={rowStyle}>
                <div style={iconStyle}>
                  <Icon name='calendar-o' />
                </div>
                <div style={grow}>
                  <Field
                    name='patientSince'
                    component={DayField}
                    fullWidth
                    floatingLabelText={TAPi18n.__('patients.patientSince')} />
                </div>
              </div>
            </div>
        }

        <RaisedButton
          type='submit'
          style={{ marginTop: 10 }}
          onClick={handleSubmit(onSubmit)}
          fullWidth
          primary
          disabled={!patientId}
          label={submitting
            ? <Icon name='refresh' spin />
            : TAPi18n.__('patients.thisSave')} />
      </form>
    </Box>
  </div>
)
