import { Comments } from '/imports/api/comments'
import { CommentsList } from '../components/CommentsList.jsx'
import { composeWithTracker } from 'react-komposer'

const composer = (props, onData) => {
  comments = Comments.find({ docId: props.docId }, { sort: { createdAt: 1 } }).fetch()
  onData(null, { comments })
}

const CommentsContainer = composeWithTracker(composer)(CommentsList)

export { CommentsContainer }
