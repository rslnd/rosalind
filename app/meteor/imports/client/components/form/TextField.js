import React from 'react'
import { TextField as MuiTextField } from 'redux-form-material-ui'

export const TextField = (props) => {
  console.log(props)

  return <MuiTextField
    fullWidth
    margin='dense'
    {...props} />
}
