import React from 'react'
import MuiCheckbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

export const Checkbox = ({ value, onChange, label, input }) =>
  <div>
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={(value || (input && input.value)) ? true : false}
          onChange={(onChange || (input && input.onChange))}
        />
      }
      label={label}
    />
  </div>
