import { withProps } from 'recompose'
import { DocumentPicker } from '../components/DocumentPicker'
import { Clients } from '../../api/clients'

export const ClientsPicker = withProps({
  toDocument: _id => Clients.findOne({ _id }),
  toLabel: client => client.description || client._id,
  options: () => Clients.find({ description: { $ne: null } }).fetch()
})(DocumentPicker)
