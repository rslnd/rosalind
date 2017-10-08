import React from 'react'
import { conditionalFloat, integer } from '../../../util/format'
import { Nil } from './Nil'

export const Round = ({ number, to, unit, className }) => {
  if (!number) {
    return <Nil />
  }

  let prepend = null
  let rounded = conditionalFloat(number)

  if (to === 0) {
    rounded = integer(number)
  }

  if (unit) {
    prepend = <small className='text-muted'>{unit}&thinsp;</small>
  }

  return <span className={className}>{prepend}{rounded}</span>
}
