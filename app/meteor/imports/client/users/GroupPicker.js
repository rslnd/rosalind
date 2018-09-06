import { withProps, mapProps } from 'recompose'
import { DocumentPicker } from '../components/DocumentPicker'
import { Groups } from '../../api/groups'

export const GroupPicker = withProps({
  toDocument: _id => Groups.findOne({ _id }),
  toLabel: group => group.name,
  options: () => Groups.find({}).fetch()
})(DocumentPicker)

export const GroupPickerField = mapProps(props => ({
  ...props.input,
  ...props
}))(GroupPicker)
