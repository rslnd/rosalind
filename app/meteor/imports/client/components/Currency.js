import React from 'react'
import { twoPlaces } from '../../util/format'

const currencyStyle = {
  opacity: 0.4
}

export const Currency = ({ style, value }) =>
  <span style={style}>
    <small style={{ currencyStyle }}>€&nbsp;</small>
    {twoPlaces(value)}
  </span>
