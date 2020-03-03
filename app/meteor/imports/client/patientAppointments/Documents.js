import React, { useState } from 'react'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import map from 'lodash/map'
import { Button } from '@material-ui/core'
import { Icon } from '../components/Icon'
import { warning, warningBorder } from '../layout/styles'
import { Media, MediaTags, Tags } from '../../api'
import { withTracker } from '../components/withTracker'

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

const Consent = ({ appointment, isCurrent, consents, isConsentRequired }) =>
  (isCurrent && (!consents || consents.length === 0))
  ? (isConsentRequired
      ? <Document isCurrent={isCurrent} isMissing>Revers benötigt</Document>
      : <Document isCurrent={isCurrent}>ohne Revers</Document>)
  : (isCurrent
    ? <Document isCurrent>Revers</Document>
    : null) // Hide irrelevant missing past consents

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

  const consentTagsIds = MediaTags.find({ isConsent: true }).fetch()
  const docs = Media.find({ appointmentId: appointment._id, kind: 'document' }, { sortBy: { createdAt: -1 }}).fetch()

  const consents = docs.filter(m =>
    consentTagsIds.length >= 0
    && m.tagIds && m.tagIds.length >= 0
    && m.tagIds.some(mt => consentTagsIds.map(t => t._id).indexOf(mt) !== -1))

  const docsByTag = sortBy('order')(map(groupBy('tag')(docs), (docs, tagId) => {
    return {
      ...consentTagsIds.find(t => t._id === tagId),
      count: docs.length,
      docs
    }
  }))

  const isConsentRequired = Tags.methods.expand(appointment.tags).some(t => t.isConsentRequired)

  return { ...props, consents, docsByTag, isConsentRequired}
}

export const Documents = withTracker(composer)(({ appointment, isCurrent, docsByTag, consents, isConsentRequired, handleMediaClick }) =>
  <div style={documentsStyle}>
    <Consent isCurrent={isCurrent} consents={consents} isConsentRequired={isConsentRequired} />
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
