import { withProps } from 'recompose'
import { DocumentPicker } from '../components/DocumentPicker'
import { Clients } from '../../api/clients'

export const ClientsPicker = withProps({
  toDocument: _id => Clients.findOne({ _id }),
  toLabel: client => client.description ||
    (client.systemInfo && client.systemInfo.hostname) ||
    client._id,
  options: () => Clients.find({ isBanned: { $ne: true } }).fetch()
})(DocumentPicker)
