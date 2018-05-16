import React from 'react'
import { toClass } from 'recompose'
import identity from 'lodash/identity'
import { compose } from 'react-komposer'
import { RelativeTime } from './RelativeTime'
import { UserHelper } from '../users/UserHelper'

const Log = ({ log, style }) => {
  return <p className='stamp text-muted' style={style}>
    {log.formatted} <UserHelper userId={log.userId} helper='firstName' /> <RelativeTime time={log.date} /><br />
  </p>
}

const LogsList = ({ logs, style }) => (
  <div>
    {logs.map((log, i) => (
      <Log key={i} log={log} style={style} />
    ))}
  </div>
)

const composer = (props, onData) => {
  const logs = (props.doc.logs || []).map(log => {
    const format = (props.format[log.type] || (() => log.type))
    const formatted = format(log)
    if (!formatted) { return null }
    return {
      formatted,
      date: log.date,
      userId: log.userId
    }
  }).filter(identity)

  onData(null, { logs })
}

const Logs = compose(composer)(toClass(LogsList))

export { Logs }
