import React from 'react'
import MuiCheckbox from '@material-ui/core/Checkbox'

export const Checkbox = ({ value, onChange, input }) =>
  <MuiCheckbox
    checked={(value || (input && input.value)) ? true : false}
    onChange={(onChange || (input && input.onChange))}
  />
