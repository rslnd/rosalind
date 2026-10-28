import { toClass, compose, withState, withProps } from 'recompose'
import { Comments } from '../../api/comments'
import { CommentsBox } from './CommentsBox'
import { withTracker } from '../components/withTracker'
import { hasRole } from '../../util/meteor/hasRole'
import { Meteor } from 'meteor/meteor'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'

const commentsBoxComposer = (props) => {
  const comments = props.comments || Comments.find({ docId: props.docId }, { sort: { createdAt: 1 } }).fetch()

  const onRemove = (commentId) => {
    Comments.actions.remove.callPromise({ commentId })
      .catch(err => { Alert.error(__('ui.error')); console.error(err) })
  }

  const onEdit = commentId => newBody => {
    Comments.actions.edit.callPromise({ commentId, newBody })
      .catch(err => { Alert.error(__('ui.error')); console.error(err) })
  }

  const canEdit = comment =>
    (comment.createdBy === Meteor.userId()) ||
    hasRole(Meteor.userId(), ['admin', 'comments-edit'])

  return { ...props, comments, onRemove, onEdit, canEdit }
}

export const CommentsContainer = compose(
  withState('_collapsed', 'setCollapsed', null),
  withProps(props => ({
    collapsed: props._collapsed === null
      ? props.collapsed
      : (props._collapsed) })),
  withTracker(commentsBoxComposer),
  toClass
)(CommentsBox)
