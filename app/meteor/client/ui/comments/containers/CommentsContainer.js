import { Comments } from 'api/comments'
import { CommentsBox } from '../components/CommentsBox'
import { composeWithTracker } from 'react-komposer'

const composer = (props, onData) => {
  const comments = Comments.find({ docId: props.docId }, { sort: { createdAt: 1 } }).fetch()
  onData(null, { comments, docId: props.docId })
}

const CommentsContainer = composeWithTracker(composer)(CommentsBox)

export { CommentsContainer }
