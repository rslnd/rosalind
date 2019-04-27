import React from 'react'
import Button from '@material-ui/core/Button'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'

const defaultIcon = 'plus-square'

const containerStyle = {
  paddingBottom: 6
}

const infoTextStyle = {
  paddingBottom: 6
}

export const ReferralsWidget = ({ style, isLoading, referrables }) =>
  (!isLoading && <div style={style ? { ...containerStyle, ...style } : style}>
    <div className='text-muted' style={infoTextStyle}>
      {__('appointments.referPatientTo')}
    </div>

    {
      referrables.map(r =>
        <ReferralButton
          key={r._id}
          referrable={r}
        />
      )
    }
  </div>) || null

const ReferralButton = ({ referrable }) => {
  const { icon, name, tag, handleClick, isReferrable, existingReferralsBySameAssignee, existingReferrals } = referrable
  const title = name || tag
  const count = (existingReferrals.length >= 2) && existingReferrals.length
  const didRefer = existingReferralsBySameAssignee.length >= 1
  const buttonIcon = didRefer ? 'check' : (icon || defaultIcon)

  return (
    <Button onClick={handleClick} disabled={!isReferrable}>
      <div style={{ textAlign: 'center' }}>
        <Icon name={buttonIcon} /><br />
        {title} {count && `(${count})`}
      </div>
    </Button>
  )
}
