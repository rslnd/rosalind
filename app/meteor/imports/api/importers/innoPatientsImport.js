import identity from 'lodash/identity'
import { getClientKey } from '../../startup/client/native/events'

const parsePatient = (hash, p) => {
  const byear = p.GEBDATUM.substr(0, 4)
  const bmonth = p.GEBDATUM.substr(4, 2)
  const bday = p.GEBDATUM.substr(6, 2)

  const contacts = [p.TEL1, p.TEL2, p.TEL3, p.TEL4]
    .filter(identity).map(t => ({
      value: t,
      channel: 'Phone'
    }))

  const patientSince = p.ERSTORD ? (() => {
    const sinceMonth = parseInt(p.ERSTORD.substr(0, 2), 10)
    let sinceYear = parseInt(p.ERSTORD.substr(2, 2), 10)
    const is1900 = ((new Date()).getYear() - 100) > 20
    if (is1900) {
      sinceYear += 1900
    } else {
      sinceYear += 2000
    }
    return new Date([sinceYear, sinceMonth, '01'].join('-'))
  })() : undefined

  // TODO: Set insuranceNetwork and isPrivateInsurance
  return {
    lastName: p.ZUNAME,
    firstName: p.VORNAME,
    titlePrepend: p.TITEL,
    gender: (p.GESCHLECHT === 'M' ? 'Male' : (p.GESCHLECHT === 'W' ? 'Female' : null)),
    address: p.STRASSE ? {
      line1: p.STRASSE,
      locality: p.ORT,
      postalCode: p.PLZ,
      country: (p.LKZ !== 'A') ? p.LKZ : null
    } : undefined,
    birthday: (p.GEBDATUM && byear) ? {
      day: parseInt(bday, 10),
      month: parseInt(bmonth, 10),
      year: parseInt(byear, 10)
    } : undefined,
    contacts,
    patientSince,
    note: [p.BM1, p.BM2, p.BM3, p.BM4].filter(identity).join('\n'),
    insuranceId: (p.GEBDATUM && byear) ? [
      p.VNRPAT, bday, bmonth, byear.substr(2, 2)
    ].join('') : undefined,
    removed: p['@deleted'] ? true : undefined, // important, if key is set at all then softRemove will filter
    external: {
      inno: {
        id: [p.PATID, p.XXREFIDXXX].join('/'),
        removed: p['@deleted'] ? true : undefined,
        hash,
        timestamps: {
          importedAt: new Date(),
          importedBy: Meteor.userId(),
          externalCreatedAt: patientSince,
          externalUpdatedBy: p.USERID
        }
      }
    }
  }
}


// Cache all known patient hashes to reduce load on the server
// Whenever a new import arrives, send only those hashes to
// the server that are not in this map yet, then cache them too
const seenPatientHashes = {}

export const innoPatientsImport = async ({ json }) => {
  const startAt = new Date()

  const allPatients = JSON.parse(json)

  const unseenPatientsByHash = {}
  const unseenPatientsHashes = []

  await Promise.all(allPatients.map(async p => {
    const hash = await sha256(JSON.stringify(p))

    if (!seenPatientHashes[hash]) {
      unseenPatientsHashes.push(hash)
      unseenPatientsByHash[hash] = p
      seenPatientHashes[hash] = true
    }
  }))

  console.log(`[innoPatientsImport] Parsed and hashed ${allPatients.length} patients in ${(new Date() - startAt) / 1000} seconds`)

  if (unseenPatientsHashes.length === []) {
    console.log('[unseenPatientsHashes] No new unseen hashes, done.')
    return
  }

  const differentHashes = await call('patients/isExternalHashDifferent', {
    externalProvider: 'inno',
    externalHashes: unseenPatientsHashes
  })

  console.log(`[innoPatientsImport] ${differentHashes.length} / ${allPatients.length} patients are different, upserting`)

  // This will only perform a super slow one-by-one upsert of all patients when the database is basically empty
  await Promise.all(differentHashes.map(async hash => {
    const raw = unseenPatientsByHash[hash]
    const patient = parsePatient(hash, raw)

    await call('patients/upsert', { patient })
  }))

  console.log(`[innoPatientsImport] Done, upserted ${differentHashes.length} patients in ${(new Date() - startAt) / 1000} seconds total`)
}


const sha256 = s =>
  window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(hex)

const call = (m, args) => new Promise((resolve, reject) => {
  Meteor.call(m, { clientKey: getClientKey(), ...args }, (e, res) => {
    if (e) { return reject(e) }
    resolve(res)
  })
})


// https://stackoverflow.com/questions/40031688/javascript-arraybuffer-to-hex
const byteToHex = []

for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, '0')
  byteToHex.push(hexOctet)
}

const hex = (arrayBuffer) => {
  const buff = new Uint8Array(arrayBuffer)
  const hexOctets = new Array(buff.length)

  for (let i = 0; i < buff.length; ++i) {
    hexOctets[i] = byteToHex[buff[i]]
  }

  return hexOctets.join('')
}
