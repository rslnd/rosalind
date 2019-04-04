import React from 'react'
import { Meteor } from 'meteor/meteor'
import Button from '@material-ui/core/Button'
import { compose } from 'recompose'
import { withTracker } from '../components/withTracker'
import { Icon } from '../components/Icon'
import { hasRole } from '../../util/meteor/hasRole'
import { getClient } from '../../api/clients/methods/getClient'
import { Clients } from '../../api/clients'
import { subscribe } from '../../util/meteor/subscribe'
import Modal from 'react-bootstrap/lib/Modal'
import { QRCode } from 'react-qr-svg'
import { primaryActive, darken } from '../layout/styles'
import { flex } from '../components/form'
import { __ } from '../../i18n'

const isRoutableOrigin = () => {
  if (window.location.origin.indexOf('localhost') === -1) {
    return true
  } else {
    throw new Error('Origin', window.location.origin, 'is not routable')
  }
}

const generatePairingCode = ({ pairingToken }) =>
  pairingToken &&
  isRoutableOrigin() &&
  [
    'rslndPair*',
    window.location.origin,
    '#',
    pairingToken
  ].join('')

const composer = ({ docId, collection }) => {
  const client = getClient()
  const canPair =
    client && client.pairingAllowed &&
    hasRole(Meteor.userId(), ['admin', 'pair'])

  if (!canPair) {
    return { canPair }
  }

  subscribe('client-producers', { clientKey: client.clientKey })
  const producers = Clients.find({ pairedTo: client._id }).fetch()
  const hasProducers = producers.length >= 1

  const pairingToken = client.pairingToken

  const handlePairingStart = () =>
    Clients.actions.pairingStart.callPromise({ clientKey: client.clientKey })

  const handlePairingCancel = () =>
    Clients.actions.pairingCancel.callPromise({ clientKey: client.clientKey })

  const pairingCode = generatePairingCode({ pairingToken })

  if (pairingCode) {
    console.log('Pairing URL', pairingCode)
  }

  return {
    canPair,
    producers,
    hasProducers,
    handlePairingStart,
    handlePairingCancel,
    pairingCode
  }
}

const PairingButtonComponent = ({ canPair, hasProducers, handlePairingStart, handlePairingCancel, pairingCode }) =>
  !canPair
    ? null
    : <div>
      <Button size='small' onClick={handlePairingStart}>
        <Icon name='camera' />
        { hasProducers && 'Bereit' }
      </Button>
      <QRModal value={pairingCode} onClose={handlePairingCancel} />
    </div>

const QRModal = ({ show, onClose, value }) =>
  !!value && <Modal
    show={!!value}
    onHide={onClose}
    animation={false}
  >
    <Modal.Body>
      <div style={flex}>
        <div style={qrContainerStyle}>
          <QRCode
            style={qrCodeStyle}
            size={qrCodeStyle.width}
            fgColor={qrColor}
            value={value}
          />
          <div style={qrLogoContainerStyle}>
            <img
              style={qrLogoStyle}
              src='/images/logo.svg'
            />
          </div>
        </div>
        <Help onCancel={onClose} />
      </div>

    </Modal.Body>
  </Modal>

const Help = ({ onCancel }) =>
  <div style={helpStyle}>
    <h2>{__('media.scanQRTitle')}</h2>

    <p>{__('media.scanQRText')}</p>

    <div className='text-muted'>
      {__('media.scanQRWaiting')}
    </div>

    <Button onClick={onCancel}>
      {__('ui.cancel')}
    </Button>
  </div>

const helpStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  textAlign: 'center',
  padding: 15
}

const qrColor = darken(primaryActive)

const qrContainerStyle = {
  width: 380,
  height: 380,
  position: 'relative'
}

const qrCodeStyle = {
  width: 380,
  height: 380
}

const logoScale = 0.18

const qrLogoContainerStyle = {
  position: 'absolute',
  top: (qrCodeStyle.width / 2) - ((qrCodeStyle.width * logoScale) / 2),
  left: (qrCodeStyle.width / 2) - ((qrCodeStyle.width * logoScale) / 2),
  width: qrCodeStyle.width * logoScale,
  height: qrCodeStyle.width * logoScale,
  background: 'white',
  // borderRadius: '100%',
  border: '6px solid white',
  backgroundColor: qrColor,
  color: qrColor,
  fontSize: 40,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const qrLogoStyle = {
  height: qrCodeStyle.width * (logoScale / 2),
  width: qrCodeStyle.width * (logoScale / 2)
}

export const PairingButton = compose(
  withTracker(composer)
)(PairingButtonComponent)
