import React, { useState } from 'react'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'
import Modal from 'react-bootstrap/lib/Modal'
import Button from '@material-ui/core/Button'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import { Messages as MessagesAPI, Patients, Settings } from '../../api'
import { subscribe } from '../../util/meteor/subscribe'
import { withTracker } from '../components/withTracker'
import { __ } from '../../i18n'
import { fullNameWithTitle } from '../../api/users/methods'
import { Icon } from '../components/Icon'
import { gray } from '../layout/styles'
import { hasRole } from '../../util/meteor/hasRole'
import { prompt } from '../layout/Prompt'
import { buildMessageText } from '../../api/messages/methods/buildMessageText'

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
  const timestamp = message.sentAt || message.createdAt

  return <div className={`direct-chat-msg ${isOutbound ? 'right' : ''}`}>
    <div className='direct-chat-infos clearfix'>
      <div className='direct-chat-name float-left enable-select'>{senderName}</div>
      <div className='direct-chat-timestamp float-right enable-select'>
        {formatDate(timestamp)}
        {
          message.status !== 'sent' &&
            <span title={JSON.stringify(message)}>
              &nbsp;({message.status})
            </span>
        }
      </div>
    </div>

    {isOutbound &&
        <div
          className='direct-chat-img flex items-center justify-center'
          style={{ backgroundColor: primaryColor }}
        >
          <img src='/logo.svg' style={{ width: '45%', height: 'auto' }} />
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

const ComposeSms = ({ patient }) => {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)

  if (!hasRole(Meteor.userId(), ['admin', 'messages-sendCustomSms'])) {
    return null
  }

  const patientId = patient._id

  let text = false
  let error = false
  try {
    text = buildMessageText({ text: value }, { date: moment('2015-11-12T14:30:00+01:00').year(moment().year()) })
  } catch (e) {
    error = true
    text = e.message
  }

  text = (value && error)
    ? `Fehler: ${value.length < 20 ? 'Mindestlänge: 20 Zeichen' : text}`
    : (!value || text.length === 0)
    ? "160 Zeichen möglich"
    : `${text.length} Zeichen`

  const handleSend = async () => {
    const ok = await prompt({
      title: `SMS an Patientin ${fullNameWithTitle(patient)} mit folgendem Text verschicken?`,
      body: value
    })
    if (!ok) { return }

    setSending(true)
    Meteor.call('messages/sendCustomSms', { patientId, text: value }, (e) => {
      if (e) {
        Alert.error(e.message)
        console.error(e)
        setSending(false)
      } else {
        Alert.success(__('ui.smsSendSuccess'))
        setSending(false)
        setValue('')
      }
    })
  }

  const disabled = !!error || !value || !text || sending

  return <div className='flex flex-column'>
    SMS schreiben:
    <TextField
      disabled={sending}
      multiline
      rows={4}
      rowsMax={7}
      value={value}
      error={error}
      helperText={text}
      onChange={e => setValue(e.target.value)}
    />
    <Button
      disabled={disabled}
      onClick={handleSend}
    >
      {
        sending
          ? 'wird gesendet...'
          : 'SMS Senden'
      }
    </Button>
  </div>
}

const SmsModal = ({ patient, messages, onClose }) => {
  if (!patient) { return null }

  const patientId = patient._id
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
        <div className='flex'>
          <div className='h-100 overflow-y-scroll' style={{ width: '70%'}}>
            <Messages
              messages={messages}
              patientName={patientName}
              primaryColor={primaryColor}
            />
          </div>
          <div style={{ width: '30%', minWidth: 270, paddingLeft: 18 }}>
            <h3>
              Nachrichten
              &nbsp;
              <span className='badge badge-info'>{messages.length}</span>
            </h3>

            <div className='flex justify-between'>
              <span>Terminerinnerungen per SMS</span>
              <Switch
                checked={!patient.noSMS}
                onChange={(e, v) =>
                  Patients.actions.setMessagePreferences
                    .callPromise({ patientId, noSMS: !v })
                    .then(() => Alert.success(__('ui.ok')))
                    .catch(e => { Alert.error(e.message); console.log(e) })
                  }
              />
            </div>

            <br />
            <br />
            <br />

            <ComposeSms
              patient={patient}
            />

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
