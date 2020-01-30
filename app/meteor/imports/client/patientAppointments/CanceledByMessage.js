import React from 'react'
import { Messages } from '../../api'
import { subscribe } from '../../util/meteor/subscribe'
import { withTracker } from '../components/withTracker'
import { __ } from '../../i18n'
import moment from 'moment'

const composer = ({ appointment }) => {
  const messageId = appointment && appointment.canceledByMessageId
  if (!messageId) { return null }

  subscribe('message', { messageId })

  const message = Messages.findOne({ _id: messageId })
  if (!message) { return null }

  return { message }
}

export const CanceledByMessage = withTracker(composer)(({ message }) => {
  const date = moment(message.createdAt).format(__('time.dateFormatWeekdayShort'))
  const time = moment(message.createdAt).format(__('time.timeFormat'))

  return <span className='text-muted'>{
    __('appointments.canceledByMessage', { date, time })
  }</span>
})
