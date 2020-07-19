import React from 'react'
import Button from '@material-ui/core/Button'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'

const containerStyle = {
  paddingBottom: 6
}

const infoTextStyle = {
  fontSize: '80%',
  marginBottom: -3,
  paddingLeft: 5
}

export const ReferralsWidget = ({
  style,
  isLoading,
  referrables,
  ...props
}) => {
  const done = referrables.filter(r => r.count || !r.isReferrable)
  const pending = referrables.filter(r => !done.find(d => d._id === r._id))
  const pendingDelayed = pending.filter(r => !r.redeemImmediately)
  const pendingImmediate = pending.filter(r => r.redeemImmediately)

  return (!isLoading && <div style={style ? { ...containerStyle, ...style } : style}>
    <div className='text-muted' style={infoTextStyle}>
      {__('appointments.referPatientTo')}
    </div>

    {props.canReferDelayed && <Referrables referrables={pendingDelayed} {...props} />}
    {props.canReferImmediate && <Referrables referrables={pendingImmediate} {...props} />}
    <Referrables referrables={done} done {...props} />
  </div>) || null
}

const Referrables = ({ referrables, done, ...props }) =>
  <div style={buttonRowStyle}>
    {
      referrables.map(r =>
        <ReferralButton
          key={r._id}
          referrable={r}
          done={done}
          {...props}
        />
      )
    }
  </div>

const buttonRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  marginTop: 10
}

const ReferralButton = ({ referrable, done, canReferImmediate, canReferDelayed }) => {
  const { icon, name, handleClick, isReferrable, count } = referrable
  const buttonIcon = (done && !isReferrable) ? 'check' : icon

  const canRefer = referrable.redeemImmediately
    ? canReferImmediate
    : canReferDelayed

  const enabled = canRefer && isReferrable

  return (
    <Button onClick={handleClick} disabled={!enabled} style={(done && isReferrable) ? buttonStyleDoneAndReferrable : buttonStyle}>
      {buttonIcon && <Icon name={buttonIcon} style={iconStyle} />}
      {isReferrable && count >= 1 && <span className='label label-default' style={countStyle}>{count}</span>}
      {name}
    </Button>
  )
}

const countStyle = {
  marginRight: 4,
  display: 'inline-block',
  opacity: 0.95,
  // zoom: 1.18,
  backgroundColor: '#444'
}

const iconStyle = {
  marginRight: 6,
  display: 'inline-block'
}

const buttonStyle = {
  display: 'flex',
  // zoom: 0.8,
  opacity: 0.8,
  marginRight: 5
}

const buttonStyleDoneAndReferrable = {
  ...buttonStyle,
  opacity: 0.6
}
