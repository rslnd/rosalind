import React from 'react'
import InputAdornment from '@material-ui/core/InputAdornment'
import NumberFormat from 'react-number-format'
import { TextField } from '../../components/form'
import { Field } from 'redux-form'
import { __ } from '../../../i18n'
import { ListItem } from './ListItem'
import { Currency } from '../../components/Currency'

const CurrencyFieldInner = (props) => {
  // Swallow warning about unknown inputRef prop input
  const { inputRef, ...restProps } = props

  return <NumberFormat
    {...restProps}
    onValueChange={values => {
      props.onChange(values.value)
    }}
    thousandSeparator=' '
    decimalSeparator=','
    onKeyDown={(e) => {
      const { key, target } = e
      const { selectionStart, value } = target
      if (key === '.') {
        e.preventDefault()
        target.value = `${value.substr(0, selectionStart)},${value.substr(selectionStart, value.length)}`
      }
    }}
  />
}

export const CurrencyField = (props) =>
  <TextField
    {...props}
    InputProps={{
      inputComponent: CurrencyFieldInner,
      startAdornment: <InputAdornment position='start'>€</InputAdornment>
    }}
  />

export const PrivateRevenue = () => (
  <ListItem icon='plus-circle' style={{ marginBottom: 20 }}>
    {__('appointments.private')}

    <div className='pull-right' style={{ marginTop: -10 }}>
      <Field
        name='revenue'
        component={CurrencyField}
        // format={twoPlaces}
        normalize={toFloat}
      />
    </div>
  </ListItem>
)

const toFloat = v =>
  v
    ? parseFloat(v.toString().replace(/,/g, '.').replace(/\s/g, ''))
    : null

export const TotalRevenue = ({ value }) => (
  (value && value > 0 && <ListItem icon='pie-chart'>
    Gesamtumsatz&ensp;
    <Currency value={value} />
  </ListItem>) || null
)
