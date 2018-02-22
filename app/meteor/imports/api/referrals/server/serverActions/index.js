import { Appointments } from '../../../appointments'
import { Referrals } from '../../'
import { redeem } from './redeem'
import { unredeem } from './unredeem'

export const serverActions = () => {
  Referrals.serverActions = {
    redeem: redeem({ Referrals, Appointments }),
    unredeem: unredeem({ Referrals, Appointments })
  }
}
