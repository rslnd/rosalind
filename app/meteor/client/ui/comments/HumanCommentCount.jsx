import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { Comments } from 'api/comments'
import { composeWithTracker } from 'react-komposer'

const HumanCommentCountSpan = ({ commentCount }) => (
  <span className="pull-right text-muted">
    {commentCount ? `${commentCount} ${TAPi18n.__('ui.comment', { count: commentCount })}` : ''}
  </span>
)

const humanCommentCountComposer = (props, onData) => {
  const commentCount = Comments.find({ docId: props.docId }).count()
  onData(null, { commentCount, docId: props.docId })
}

export const HumanCommentCount = composeWithTracker(humanCommentCountComposer)(HumanCommentCountSpan)
