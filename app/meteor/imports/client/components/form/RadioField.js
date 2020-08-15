import React from 'react'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'

export const RadioField = ({ name, label, horizontal, input, meta, options = [] }) => {
  return <FormControl component='fieldset'>
    {
      label &&
      <FormLabel component='legend'>{label}</FormLabel>
    }

    <RadioGroup
      name={name}
      value={input.value}
      onChange={input.onChange}
      row={horizontal}
    >
      {options.map(({ label, value, title, disabled }) =>
        <FormControlLabel
          key={value}
          value={value}
          control={<Radio />}
          title={title}
          label={label}
          disabled={disabled}
        />
      )}
    </RadioGroup>
  </FormControl>
}
