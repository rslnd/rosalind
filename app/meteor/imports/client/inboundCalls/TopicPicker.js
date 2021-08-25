import { Meteor } from 'meteor/meteor'
import { InboundCallsTopics } from '../../api/inboundCalls'
import { DocumentPicker } from '../components/DocumentPicker'
import { withTracker } from '../components/withTracker'
import { compose, withProps, mapProps } from 'recompose'
import { __ } from '../../i18n'
import { hasRole } from '../../util/meteor/hasRole'
import identity from 'lodash/identity'

const composer = (props) => ({
  ...props,
  options: [
    props.allTopics && { _id: false, label: __('inboundCalls.topicAll') },
    hasRole(Meteor.userId(), ['inboundCalls', 'inboundCalls-topic-null']) &&
      { _id: null, label: __('inboundCalls.thisOpen') },
    ...InboundCallsTopics.find({}, { sort: { order: 1 } }).fetch().filter(t =>
      hasRole(Meteor.userId(), ['inboundCalls', 'inboundCalls-topic-' + t.slug])
    )
  ].filter(identity)
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
