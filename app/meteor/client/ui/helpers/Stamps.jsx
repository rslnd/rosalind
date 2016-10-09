import React from 'react'
import { compose } from 'react-komposer'
import { TAPi18n } from 'meteor/tap:i18n'
import { RelativeTime } from './RelativeTime'
import { UserHelper } from 'client/ui/users/UserHelper'

const Stamp = ({ stamp }) => {
  return <p className="stamp text-muted pull-left">
    {stamp.verb} <UserHelper userId={stamp.userId} helper="firstName" /> <RelativeTime time={stamp.time} />
  </p>
}

const StampsList = ({ stamps }) => (
  <div>
    {stamps.map((stamp) => (
      <Stamp key={[stamp.time, stamp.verb, stamp.userId].join()} stamp={stamp} />
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

const Stamps = compose(composer)(StampsList)

export { Stamps }
