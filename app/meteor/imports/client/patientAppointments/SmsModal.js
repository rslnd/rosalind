import React from 'react'
import moment from 'moment-timezone'
import Modal from 'react-bootstrap/lib/Modal'
import Button from '@material-ui/core/Button'
import { Messages as MessagesAPI, Settings } from '../../api'
import { subscribe } from '../../util/meteor/subscribe'
import { withTracker } from '../components/withTracker'
import { __ } from '../../i18n'
import { fullNameWithTitle } from '../../api/users/methods'
import { Icon } from '../components/Icon'
import { gray } from '../layout/styles'

const composer = (props) => {
  if (!props.patient) { return null }
  const patientId = props.patient._id

  subscribe('messages-patient', { patientId })

  const messages = MessagesAPI.find(
    { patientId },
    { sort: { createdAt: 1 }}
  ).fetch()

  return {
    ...props,
    messages
  }
}

const formatDate = (d) =>
  d && moment(d).format([__('time.dateFormat'), __('time.timeFormat')].join(' '))

const Message = ({ message, patientName, primaryColor }) => {
  const isInbound = message.direction === 'inbound'
  const isOutbound = !isInbound
  const senderName = isInbound ? patientName : ''

  return <div className={`direct-chat-msg ${isOutbound ? 'right' : ''}`}>
    <div className='direct-chat-infos clearfix'>
      <div className='direct-chat-name float-left enable-select'>{senderName}</div>
      <div className='direct-chat-timestamp float-right enable-select'>{formatDate(message.sentAt)}</div>
    </div>

    {isOutbound &&
        <div
          className='direct-chat-img flex items-center justify-center'
          style={{ backgroundColor: primaryColor }}
        >
          <img src='/logo.svg' style={{ width: '60%', height: 'auto' }} />
        </div>
    }

    {
      isInbound &&
        <div
          className='direct-chat-img flex items-center justify-center'
          style={{ backgroundColor: gray }}
        >
          <Icon name='user' />
        </div>
    }

    <div className='direct-chat-text enable-select'>
      {message.text}
    </div>
  </div>
}

const Messages = ({ messages, ...props }) =>
  messages.map(m =>
    <Message
      key={m._id}
      message={m}
      {...props}
    />
  )

const SmsModal = ({ patient, messages, onClose }) => {
  if (!patient) { return null }

  const patientName = fullNameWithTitle(patient)
  const primaryColor = Settings.get('primaryColor')

  return <>
    <Modal
      style={modalStyle}
      enforceFocus={false}
      show={true}
      onHide={onClose}
      bsSize='large'>
      <Modal.Body>
        Messages: {messages.length}
        <div className='flex'>
          <div className='h-100 overflow-y-scroll'>
            <Messages
              messages={messages}
              patientName={patientName}
              primaryColor={primaryColor}
            />
          </div>
          <div className='w4'>
            SMS settings

          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className='pull-right'>
          <Button
            color='primary'
            onClick={onClose}
          >
            {__('ui.ok')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  </>
}

const modalStyle = {
  minWidth: 800
}

export const SmsModalContainer = withTracker(composer)(SmsModal)
