import React from 'react'
import { mapProps, toClass } from 'recompose'
import { __ } from '../../i18n'
import { RelativeTime } from './RelativeTime'
import { UserHelper } from '../users/UserHelper'

const Stamp = ({ stamp, style }) => {
  return <p className='stamp text-muted' style={style}>
    {stamp.verb} <UserHelper userId={stamp.userId} helper='firstName' /> <RelativeTime time={stamp.time} /><br />
  </p>
}

const StampsList = ({ stamps, style }) => (
  <div>
    {stamps.map((stamp) => (
      <Stamp key={[stamp.time, stamp.verb, stamp.userId].join()} stamp={stamp} style={style} />
    ))}
  </div>
)

const composer = props => {
  const stamps = props.fields.filter((field) => {
    return props.doc[`${field}By`] && props.doc[`${field}At`]
  }).map((field) => {
    return {
      verb: __(props.collectionName + '.' + field + 'By'),
      userId: props.doc[`${field}By`],
      time: props.doc[`${field}At`]
    }
  })

  return { stamps }
}

const Stamps = mapProps(composer)(toClass(StampsList))

export { Stamps }
