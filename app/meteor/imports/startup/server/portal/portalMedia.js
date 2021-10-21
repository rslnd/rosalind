import { PortalMedia } from "../../../api/media/collection"
import { patientFromToken } from "./portalLogin"

export const findPubilshedMedia = ({ token }) => {
  const patient = patientFromToken(token)

  const media = PortalMedia.find({ patientId: patient._id }, {
    fields: {
      b64: 0
    }
  }).fetch()

  return media
}

export const downloadMedia = ({ token, _id }) => {
  const patient = patientFromToken(token)

  const media = PortalMedia.findOne({
    patientId: patient._id,
    _id
  })

  return media
}
