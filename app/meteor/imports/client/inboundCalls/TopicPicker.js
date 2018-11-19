import { InboundCallsTopics } from '../../api/inboundCalls'
import { DocumentPicker } from '../components/DocumentPicker'
import { withTracker } from '../components/withTracker'
import { compose, withProps, mapProps } from 'recompose'
import { __ } from '../../i18n'

const composer = (props) => ({
  ...props,
  options: InboundCallsTopics.find({}, { sort: { order: 1 } }).fetch()
})

const asField = mapProps(p => ({
  ...p,
  ...p.input,
  isStateless: true
}))

export const TopicPicker = compose(
  asField,
  withTracker(composer),
  withProps(props => ({
    toDocument: _id => InboundCallsTopics.findOne({ _id }),
    toLabel: t => t.label,
    options: () => props.options,
    placeholder: __('inboundCalls.topic')
  }))
)(DocumentPicker)
