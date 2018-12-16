import React from 'react'
import { TagsList } from '../tags/TagsList'
import { Icon } from '../components/Icon'
import { __ } from '../../i18n'
import { getDefaultDuration } from '../../api/appointments/methods/getDefaultDuration'

export const TagDetails = ({ tag, availability }) => {
  const t = tag
  if (!t) { return null }

  return <div style={containerStyle}>
    <Row><TagsList tags={[t]} /></Row>
    <Row><Duration t={t} availability={availability} /></Row>
    <Row><Private t={t} /></Row>
    <Row><Revenue t={t} /></Row>
    <Row><b>{t.description}</b></Row>
    <Row><Synonyms t={t} /></Row>
  </div>
}

const containerStyle = {
  padding: 5
}

const Row = ({ children }) =>
  <div style={rowStyle}>{children}</div>

const rowStyle = {
  padding: 5
}

const Duration = ({ t, availability = {} }) => {
  const { calendarId, assigneeId, from } = availability

  const min = getDefaultDuration({
    calendarId,
    assigneeId,
    date: from,
    tags: [t._id]
  })
  return <span>
    <Icon name='clock-o' /> {min} min
  </span>
}

const Revenue = ({ t }) =>
  <div>
    {
      t.minRevenue && t.maxRevenue
      ? <span><E /> {t.minRevenue}&ndash;{t.maxRevenue}</span>
      : t.minRevenue
      ? <span>Ab <E /> {t.minRevenue}+</span>
      : t.maxRevenue
      ? <span>Bis <E /> {t.maxRevenue}</span>
      : t.defaultRevenue > 0
      ? <span><E /> {t.defaultRevenue}</span>
      : t.defaultRevenue === 0
      ? <span className='text-muted'>Kostenlos</span>
      : t.privateAppointment
      ? <span><span className='text-muted'>Variable Preise</span></span>
      : <span>&nbsp;</span> // Placeholder, no price for insurance
    }
  </div>

const E = () => <Icon name='eur' />
const Private = ({ t }) => <span className='text-muted'>
  {
    t.privateAppointment
    ? __('appointments.private')
    : __('appointments.insurance')
  }
</span>

const Synonyms = ({ t }) =>
  t.synonyms
  ? <span className='text-muted'>
    {t.synonyms && t.synonyms.map(s =>
      <span key={s} style={synonymStyle}>
        {s}
      </span>
    )}
  </span>
  : null

const synonymStyle = {
  display: 'inline-block',
  marginRight: 3,
  marginBottom: 3
}
