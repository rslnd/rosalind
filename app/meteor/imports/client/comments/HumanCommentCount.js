import React from 'react'
import { toClass } from 'recompose'
import { __ } from '../../i18n'
import { Comments } from '../../api/comments'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'

const HumanCommentCountSpan = ({ commentCount }) => (
  <span className='pull-right text-muted'>
    {commentCount ? `${commentCount} ${__('ui.comment', { count: commentCount })}` : ''}
  </span>
)

const humanCommentCountComposer = (props, onData) => {
  const commentCount = Comments.find({ docId: props.docId }).count()
  onData(null, { commentCount, docId: props.docId })
}

export const HumanCommentCount = composeWithTracker(humanCommentCountComposer)(toClass(HumanCommentCountSpan))
