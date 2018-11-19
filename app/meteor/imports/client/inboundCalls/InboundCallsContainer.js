import { toClass } from 'recompose'
import { InboundCalls, InboundCallsTopics } from '../../api/inboundCalls'
import { InboundCallsScreen } from './InboundCallsScreen'
import { withTracker } from '../components/withTracker'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  const handle = subscribe('inboundCalls')
  if (handle.ready()) {
    const topic = props.match.params.slug &&
      InboundCallsTopics.findOne({ slug: props.match.params.slug })

    const selector = topic
      ? { topicId: topic._id }
      : {}

    const inboundCalls = InboundCalls.find(selector, { sort: { createdAt: 1 } }).fetch()
    const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
    const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })

    return { inboundCalls, resolve, unresolve, topic }
  } else {
    return {
      isLoading: true
    }
  }
}

export const InboundCallsContainer = withTracker(composer)(toClass(InboundCallsScreen))
