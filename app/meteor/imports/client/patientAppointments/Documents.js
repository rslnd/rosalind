import React, { useState } from 'react'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import map from 'lodash/map'
import { Button } from '@material-ui/core'
import { Icon } from '../components/Icon'
import { warning, warningBorder } from '../layout/styles'
import { Media, MediaTags, Tags } from '../../api'
import { withTracker } from '../components/withTracker'
import { Popover, setNextMedia } from './Consents'

const Document = ({ children, isCurrent, isMissing, ...props }) =>
  (!isCurrent && isMissing)
  ? null // Hide irrelevant missing docs of past appointments
  : <Button
    variant={isCurrent ? 'outlined' : null}
    style={isMissing ? buttonMissingStyle : buttonStyle}
    {...props}
  >
    {isMissing
      ? <span><Icon name='exclamation-triangle' /> &nbsp;{children}</span>
      : children}
  </Button>

const buttonStyle = {
  zoom: 0.7,
  margin: 4,
  opacity: 0.6
}

const buttonMissingStyle = {
  ...buttonStyle,
  opacity: 0.9,
  color: 'white',
  borderColor: warningBorder,
  backgroundColor: warning
}

const Consent = ({ appointment, isCurrent, consents, isConsentRequired, handleMediaClick, consentTags }) => {
  const [open, setOpen] = useState(false)

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
          onClose={handleSelectConsentClose} />
      </>
      : <Document isCurrent={isCurrent}>ohne Revers</Document>)
  : (isCurrent
    ? <Document isCurrent onClick={() => handleMediaClick(consents[0]._id)}>Revers</Document>
    : null) // Hide irrelevant missing past consents

}

const ScanButton = ({}) => {
  const [hover, setHover] = useState(false)
  return <Document
    title='Weiteres Dokument einscannen'
    isCurrent={true}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    style={scanButtonStyle}
  >
    <Icon name='plus' style={scanIconStyle} /></Document>
}

const scanButtonStyle = {
  ...buttonStyle,
  width: 25
}

const scanIconStyle = {
  opacity: 0.8
}


const composer = props => {
  const { appointment } = props

  const mediaTags = MediaTags.find({}).fetch()
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

  const isConsentRequired = Tags.methods.expand(appointment.tags).some(t => t.isConsentRequired)

  return { ...props, consents, docsByTag, isConsentRequired, consentTags}
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
          isCurrent={isCurrent}
          onClick={() => handleMediaClick(t.docs[0]._id)}
        >
          {(t.docs.length >= 2) ? (t.tagPlural || 'Neue Dokumente') : (t.tag || 'Neues Dokument')}
          {(t.docs.length >= 2) && <span>&nbsp;({t.docs.length})</span>}
        </Document>
      )
    }
    {isCurrent && <ScanButton />}
  </div>
)

const documentsStyle = {
  display: 'flex',
  justifyContent: 'flex-end'
}
