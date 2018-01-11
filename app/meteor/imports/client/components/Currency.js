import React from 'react'
import { twoPlaces } from '../../util/format'

const currencyStyle = {
  fontSize: 36,
  verticalAlign: 'baseline'
}

export const Currency = ({ style, value }) =>
  <span style={{ ...currencyStyle, ...style }}>
    <small className='text-muted'>€&nbsp;</small>
    {twoPlaces(value || 0.0)}
  </span>
