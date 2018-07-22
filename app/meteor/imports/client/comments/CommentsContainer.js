import { toClass } from 'recompose'
import { Comments } from '../../api/comments'
import { CommentsBox } from './CommentsBox'
import { withTracker } from 'meteor/react-meteor-data'

const commentsBoxComposer = (props) => {
  const comments = Comments.find({ docId: props.docId }, { sort: { createdAt: 1 } }).fetch()

  const onRemove = (commentId) => {
    Comments.actions.remove.callPromise({ commentId })
  }

  return { ...props, comments, onRemove }
}

export const CommentsContainer = withTracker(commentsBoxComposer)(toClass(CommentsBox))
