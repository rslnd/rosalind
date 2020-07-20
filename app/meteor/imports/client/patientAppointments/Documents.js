import React, { useState } from 'react'
import Alert from 'react-s-alert'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import map from 'lodash/map'
import { Button, Menu, MenuItem } from '@material-ui/core'
import { Icon } from '../components/Icon'
import { warning, warningBorder, darkGray, gray } from '../layout/styles'
import { Media, MediaTags, Tags, Clients } from '../../api'
import { withTracker } from '../components/withTracker'
import { Popover, setNextMedia } from './Consents'
import { toNative, getClientKey } from '../../startup/client/native/events'
import { getClient } from '../../api/clients/methods/getClient'
import { hasRole } from '../../util/meteor/hasRole'

const Document = ({ children, isCurrent, isMissing, color, ...props }) =>
  (!isCurrent && isMissing)
  ? null // Hide irrelevant missing docs of past appointments
  : <Button
    size='small'
    variant={isCurrent ? 'outlined' : null}
    style={isMissing ? buttonMissingStyle : buttonStyle}
    {...props}
  >
    {isMissing
      ? <span>
        <Icon name='exclamation-triangle' />&emsp;{children}
      </span>
      : <span>
        { color && <span>
          <Icon name='circle' style={{color}} />&emsp;</span>}
        {children}
      </span>}
  </Button>

const buttonStyle = {
  // zoom: 0.7,
  margin: 4,
  color: darkGray,
  borderColor: gray
}

const buttonMissingStyle = {
  ...buttonStyle,
  color: 'white',
  borderColor: warningBorder,
  backgroundColor: warning
}

const Consent = ({ appointment, isCurrent, consents, isConsentRequired, handleMediaClick, consentTags }) => {
  const [open, setOpen] = useState(false)

  const color = consentTags[0].color // TODO make explicit

  const handleSelectConsentOpen = () => {
    setOpen(true)

    const consentTagId = consentTags[0]._id // TODO make explicit

    setNextMedia({
      patientId: appointment.patientId,
      appointmentId: appointment._id,
      cycle: null,
      tagIds: [consentTagId]
    })
  }

  const handleSelectConsentClose = () => {
    setOpen(false)
    setNextMedia({
      patientId: appointment.patientId,
      appointmentId: appointment._id,
      cycle: null,
      tagIds: []
    })
  }

  return   (isCurrent && (!consents || consents.length === 0))
  ? (isConsentRequired
      ? <>
        <Document
          isCurrent={isCurrent}
          isMissing
          onClick={handleSelectConsentOpen}>Revers benötigt</Document>
        <Popover
          open={open}
          appointmentId={appointment._id}
          patientId={appointment.patientId}
          scan={scan}
          onClose={handleSelectConsentClose} />
      </>
      : <Document isCurrent={isCurrent}>ohne Revers</Document>)
  : (isCurrent
    ? <Document
      isCurrent
      color={color}
      onClick={() => handleMediaClick(consents[0]._id)}>
        Revers
      </Document>
    : null) // Hide irrelevant missing past consents

}

const scanButtonComposer = (props) => {
  const client = getClient()
  const allowedProfiles = (client && client.settings && client.settings.scan && client.settings.scan.allowedProfiles) || []
  const canScan = (allowedProfiles.length >= 1) && hasRole(Meteor.userId(), ['media', 'media-insert', 'media-insert-documents', 'admin'])

  if (!canScan) { return null }

  const selector = { kind: 'document' }

  if (props.pinned) {
    selector.pinned = true
  }

  const mediaTags = MediaTags.find(selector, { sort: { order: 1 }}).fetch()

  return {
    ...props,
    mediaTags,
    allowedProfiles,
    profile: allowedProfiles[0],
    canScan
  }
}

const scan = ({ mediaTag, patientId, appointmentId }) => {
  const client = getClient()
  const allowedProfiles = (client && client.settings && client.settings.scan && client.settings.scan.allowedProfiles)

  if (!allowedProfiles) {
    throw new Error('Cannot scan, no profiles in settings')
  }

  const profile = allowedProfiles[0]

  console.log('[Documents] Scanning', { mediaTag, profile })

  Clients.actions.setNextMedia.callPromise({
    clientKey: getClientKey(),
    patientId,
    appointmentId,
    tagIds: [ mediaTag._id ],
    cycle: null
  })

  Alert.info(mediaTag.name + ' wird gescannt')
  toNative('scanStart', { profile })
}


export const ScanButton = withTracker(scanButtonComposer)(({ mediaTags, profile, patientId, appointmentId, children, isCurrent }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return <>
    <Document
      title='Dokument einscannen'
      isCurrent={isCurrent}
      onClick={handleClick}
      style={children ? {} : scanButtonStyle}
    >
      <Icon name='plus' style={scanIconStyle} />
      {children && <span>&emsp;{children}</span>}
    </Document>
    <Menu
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      {mediaTags.map((mediaTag) =>
        <MenuItem
          key={mediaTag._id}
          onClick={() => {
            scan({ mediaTag, patientId, appointmentId })
            handleClose()
          }}>
            <Icon name='circle' style={{ color: mediaTag.color }} />
            &emsp;
            {mediaTag.name}
        </MenuItem>
      )}
    </Menu>
  </>
})

const scanButtonStyle = {
  ...buttonStyle,
  width: 25
}

const scanIconStyle = {
  opacity: 0.9
}


const composer = props => {
  const { appointment } = props

  const mediaTags = MediaTags.find({ kind: 'document' }, { sort: { order: 1 }}).fetch()
  const consentTags = MediaTags.find({ isConsent: true }).fetch()
  const docs = Media.find({ appointmentId: appointment._id, kind: 'document' }, { sortBy: { createdAt: -1 }}).fetch()

  const consents = docs.filter(m =>
    consentTags.length >= 0
    && m.tagIds && m.tagIds.length >= 0
    && m.tagIds.some(mt => consentTags.map(t => t._id).indexOf(mt) !== -1))

  // const docsByTag = sortBy('order')(map(groupBy('tagId')(docs), (docs, tagId) => {
  const docsByTag = sortBy('order')(map(groupBy(m => m.tagIds && m.tagIds[0])(docs), (docs, tagId) => {
    return {
      ...mediaTags.find(t => t._id === tagId),
      isConsent: consentTags.find(t => t._id === tagId),
      count: docs.length,
      docs
    }
  })).filter(d => !d.isConsent)

  const isConsentRequired = Tags.methods.expand(appointment.tags).some(t => t && t.isConsentRequired)

  return { ...props, consents, docsByTag, isConsentRequired, consentTags, mediaTags }
}

export const Documents = withTracker(composer)(({ appointment, isCurrent, docsByTag, consents, isConsentRequired, consentTags, handleMediaClick }) =>
  <div style={documentsStyle}>
    <Consent
      appointment={appointment}
      isCurrent={isCurrent}
      consents={consents}
      isConsentRequired={isConsentRequired}
      consentTags={consentTags}
      handleMediaClick={handleMediaClick}
    />
    {
      docsByTag.map((t, i) =>
        <Document
          key={t._id || i}
          color={t.color}
          isCurrent={isCurrent}
          onClick={() => handleMediaClick(t.docs[0]._id)}
        >
          {(t.docs.length >= 2) ? (t.namePlural || 'Neue Dokumente') : (t.name || 'Neues Dokument')}
          {(t.docs.length >= 2) && <span>&nbsp;({t.docs.length})</span>}
        </Document>
      )
    }
    <ScanButton
      isCurrent={isCurrent}
      patientId={appointment.patientId}
      appointmentId={appointment._id}
    />
  </div>
)

const documentsStyle = {
  display: 'flex',
  justifyContent: 'flex-end'
}
