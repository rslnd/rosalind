import { Comments } from '../../api/comments'
import { CommentsBox } from './CommentsBox'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'

const commentsBoxComposer = (props, onData) => {
  const comments = Comments.find({ docId: props.docId }, { sort: { createdAt: 1 } }).fetch()

  const onRemove = (commentId) => {
    Comments.actions.remove.callPromise({ commentId })
  }

  onData(null, { ...props, comments, onRemove })
}

export const CommentsContainer = composeWithTracker(commentsBoxComposer)(CommentsBox)
