import React from 'react'
import { InfoBox } from './ReportSummary'
import { grayActive, gray, green } from '../layout/styles'
import { __ } from '../../i18n'

export const ReferralsDetailSummary = ({ referrals }) => {
  const referred = referrals.length
  const pending = referrals.filter(r => r.pendingAt).length
  const redeemed = referrals.filter(r => r.redeemedAt).length

  return <div style={rowStyle}>
    <div style={colStyle}>
      <InfoBox
        text={__('reports.referralReferred')}
        color={grayActive}
        position={1}
        icon='commenting-o'
      >{referred}</InfoBox>
    </div>

    <div className='col-md-4 col-sm-4 col-xs-4'>
      <InfoBox
        text={__('reports.referralPending')}
        description={referred && pending && __('reports.ofReferred', { percent: Math.floor(100 * pending / referred) })}
        color={gray}
        position={2}
        icon='clock-o'
      >{pending}</InfoBox>
    </div>

    <div style={colStyle}>
      <InfoBox
        text={__('reports.referralRedeemed')}
        color={green}
        position={3}
        icon='check'
        description={referred && redeemed && __('reports.ofReferred', { percent: Math.floor(100 * redeemed / referred) })}
      >{redeemed}</InfoBox>
    </div>
  </div>
}

const rowStyle = {
  display: 'flex'
}

const colStyle = {
  flex: 1
}
