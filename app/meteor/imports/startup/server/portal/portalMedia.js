import { PortalMedia } from "../../../api/media/collection"
import { patientFromToken } from "./portalLogin"

export const findPubilshedMedia = async ({ token }) => {
  const patient = patientFromToken(token)

  const media = await PortalMedia.find({ patientId: patient._id }, {
    fields: {
      b64: 0
    }
  }).fetchAsync()

  return media
}

export const downloadMedia = async ({ token, _id }) => {
  const patient = patientFromToken(token)

  const media = await PortalMedia.findOneAsync({
    patientId: patient._id,
    _id
  })

  return media
}
