import React from 'react'
import Button from '@material-ui/core/Button'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'

const defaultIcon = 'plus-square'

const containerStyle = {
  paddingBottom: 6
}

const infoTextStyle = {
  paddingBottom: 6
}

export const ReferralsWidget = ({ referrableTags, referrableCalendars, length }) =>
  length >= 1 && <div style={containerStyle}>
    <div className='text-muted' style={infoTextStyle}>
      {TAPi18n.__('appointments.referPatientTo')}
    </div>

    {
      referrableCalendars.map(r =>
        <ReferralButton
          key={r._id}
          referral={r}
        />
      )
    }

    {
      referrableTags.map(r =>
        <ReferralButton
          key={r._id}
          referral={r}
        />
      )
    }
  </div> || null

const ReferralButton = ({ referral }) => {
  const { icon, name, tag, handleClick, isReferrable, existingReferralBySameAssignee } = referral
  const title = name || tag
  const iconOrCheckmark = existingReferralBySameAssignee
    ? 'check'
    : (icon || defaultIcon)

  return (
    <Button onClick={handleClick} disabled={!isReferrable}>
      <div style={{ textAlign: 'center' }}>
        <Icon name={iconOrCheckmark} /><br />
        {title}
      </div>
    </Button>
  )
}
