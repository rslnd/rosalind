import React from 'react'
import Button from 'material-ui/Button'
import { Icon } from '../../components/Icon'

const defaultIcon = 'plus-square'

const containerStyle = {
  paddingBottom: 6
}

const infoTextStyle = {
  paddingBottom: 6
}

export const ReferralsWidget = ({ referrableTags, referrableCalendars, length, insert }) =>
  length >= 1 && <div style={containerStyle}>
    <div className='text-muted' style={infoTextStyle}>
      PatientIn empfehlen
    </div>

    {
      referrableCalendars.map(r =>
        <ReferralButton
          key={r._id}
          name={r.name}
          icon={r.icon}
          onClick={insert}
        />
      )
    }

    {
      referrableTags.map(r =>
        <ReferralButton
          key={r._id}
          name={r.tag}
          icon={r.icon}
          onClick={insert}
        />
      )
    }
  </div> || null

const ReferralButton = ({ icon, name, onClick }) =>
  <Button onClick={onClick}>
    <div style={{ textAlign: 'center' }}>
      <Icon name={icon || defaultIcon} /><br />
      {name}
    </div>
  </Button>
