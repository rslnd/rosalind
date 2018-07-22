import React from 'react'
import { toClass } from 'recompose'
import { TAPi18n } from 'meteor/tap:i18n'
import { Comments } from '../../api/comments'
import { withTracker } from 'meteor/react-meteor-data'

const HumanCommentCountSpan = ({ commentCount }) => (
  <span className='pull-right text-muted'>
    {commentCount ? `${commentCount} ${TAPi18n.__('ui.comment', { count: commentCount })}` : ''}
  </span>
)

const humanCommentCountComposer = (props) => {
  const commentCount = Comments.find({ docId: props.docId }).count()
  return { commentCount, docId: props.docId }
}

export const HumanCommentCount = withTracker(humanCommentCountComposer)(toClass(HumanCommentCountSpan))
