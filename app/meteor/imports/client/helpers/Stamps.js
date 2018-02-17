import React from 'react'
import { toClass } from 'recompose'
import { compose } from 'react-komposer'
import { TAPi18n } from 'meteor/tap:i18n'
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

const composer = (props, onData) => {
  const stamps = props.fields.filter((field) => {
    return props.doc[`${field}By`] && props.doc[`${field}At`]
  }).map((field) => {
    return {
      verb: TAPi18n.__(props.doc.collection()._name + '.' + field + 'By'),
      userId: props.doc[`${field}By`],
      time: props.doc[`${field}At`]
    }
  })

  onData(null, { stamps })
}

const Stamps = compose(composer)(toClass(StampsList))

export { Stamps }
