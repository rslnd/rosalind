import moment from 'moment-timezone'
import { Patients } from '../../../api/patients'
import { Messages } from '../../../api'
import { v4 as uuidv4}  from 'uuid'
import { buildMessageText } from '../../../api/messages/methods/buildMessageText'
import { SMS } from '../../../api/messages/server/channels/sms'
import { normalizeName } from '../../../api/patients/util/normalizeName'

export const portalLogin = (unsafeArgs) => {
  try {
    check(unsafeArgs, {
      firstName: String,
      lastName: String,
      insuranceId: String
    })

    const { firstName, lastName, insuranceId } = unsafeArgs

    if (insuranceId.length !== 10) {
      console.log('portalLogin: invalid insuranceId', { insuranceId })
      return true
    }

    console.log('portalLogin attempt', insuranceId)

    const patient = Patients.findOne({
      insuranceId,
      lastNameNormalized: normalizeName(lastName)
    })

    if (!patient) {
      console.log('portalLogin: patient not found', firstName, lastName, insuranceId)
      return true // always return true to prevent user enumeration attack
    }

    const patientId = patient._id

    if (normalizeName(patient.firstName) !== normalizeName(firstName)) {
      console.log('portalLogin: patient not found, first name mismatch, entered', { patientId, entered: firstName, patientFirstName: patient.firstName })
      return true
    }

    if (!patient.portalVerifiedBy || !patient.portalVerifiedAt) {
      console.log('portalLogin: patient not verified for portal', { patientId })
      return true
    }

    const toContact = patient.contacts.find(c =>
      (c.portalVerifiedAt && c.channel === 'Phone'))
    const to = toContact && toContact.valueNormalized

    if (!to) {
      console.error('portalLogin: patient has no valid phone number verified for portal', { patientId })
      return true
    }

    // limit costly SMS DoS
    if (patient.portalTwoFactorCodeCreatedAt && (patient.portalTwoFactorCodeCreatedAt > (new Date() - (1000 * 60 * 4)))) {
      console.error('portalLogin: patient already requested a 2fa code within the past 4 minutes, ignoring next login attempt', { patientId })
      return true
    }


    const code = (Math.floor(Math.random() * 90000) + 10000).toString()

    Patients.update({ _id: patient._id }, {
      $set: {
        portalTwoFactorCode: code,
        portalTwoFactorCodeCreatedAt: new Date(),
        portalSessionToken: null // logout any other sessions
      }
    })

    console.log('portalLogin: created 2fa code for', { patientId })

    const text = '%code ist Ihr Einmalkennwort. Teilen Sie dieses Einmalkennwort nicht mit anderen Personen.'

    const messageId = Messages.insert({
      type: 'portalLogin',
      channel: 'SMS',
      direction: 'outbound',
      text: buildMessageText(
        { text: text },
        { code: code }
      ),
      to,
      status: 'final',
      invalidBefore: new Date(),
      invalidAfter: moment().add(15, 'minutes').toDate(),
      patientId,
      payload: {
        patientId
      }
    })

    SMS.send(messageId)

    console.log('portalLogin: sent code in message', { messageId, patientId })

    return true

  } catch (e) {
    console.error('portalLogin failed with unknown error')
    console.error(e)
    return true // avoid user enumeration, always return true
  }
}

export const twoFactor = (unsafeArgs) => {
  try {
    check(unsafeArgs, {
      firstName: String,
      lastName: String,
      insuranceId: String,
      code: String
    })

    const { firstName, lastName, insuranceId, code } = unsafeArgs

    if (code.length !== 5) {
      console.error('two factor code was', code)
      throw new Error(`Invalid two factor code length ${code.length}`)
    }

    if (insuranceId.length !== 10) {
      console.log('portalLogin twoFactor: invalid insuranceId', { insuranceId })
      return { error: 500 }
    }

    console.log('portalLogin twoFactor attempt', insuranceId)

    const patient = Patients.findOne({
      insuranceId,
      lastNameNormalized: normalizeName(lastName)
    })

    if (!patient) {
      console.log('portalLogin twoFactor: patient not found', firstName, lastName, insuranceId)
      return { error: 500 }
    }

    const patientId = patient._id

    if (normalizeName(patient.firstName) !== normalizeName(firstName)) {
      console.log('portalLogin twoFactor: patient not found, first name mismatch, entered', { patientId, entered: firstName, patientFirstName: patient.firstName })
      return { error: 500 }
    }

    if (!patient.portalVerifiedBy || !patient.portalVerifiedAt) {
      console.log('portalLogin twoFactor: patient not verified for portal', { patientId })
      return { error: 500 }
    }

    if (!patient.portalTwoFactorCode || !patient.portalTwoFactorCodeCreatedAt) {
      console.log('portalLogin twoFactor: no code was generated', { patientId })
      return { error: 500 }
    }

    if (patient.portalTwoFactorCodeCreatedAt < (new Date() - (1000 * 60 * 8))) {
      console.log('portalLogin twoFactor: code expired', { patientId })
      return { error: 400, reason: 'codeExpired' }
    }

    if (patient.portalTwoFactorCode !== code) {
      console.log('portalLogin twoFactor: wrong code', { patientId })
      return { error: 400, reason: 'codeWrong' }
    }

    const token = uuidv4()

    Patients.update({ _id: patientId }, {
      $set: {
        portalSessionToken: token,
        portalSessionCreatedAt: new Date()
      }
    })

    return { ok: true, token }
  } catch (e) {
    console.error('portal twoFactor failed with unknown error', e)
    return { error: 500 }
  }
}

export const patientFromToken = (token) => {
  check(token, String)

  const patient = Patients.findOne({ portalSessionToken: token })

  if (!patient) {
    throw new Error(`No patient found with token ${token}`)
  }

  if (!patient.portalSessionCreatedAt || patient.portalSessionCreatedAt < (new Date() - (1000 * 60 * 20))) {
    throw new Error(`Session token expired for patient ${patient._id}`)
  }

  return patient
}