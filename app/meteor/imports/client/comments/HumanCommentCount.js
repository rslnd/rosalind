import React from 'react'
import { toClass } from 'recompose'
import { __ } from '../../i18n'
import { Comments } from '../../api/comments'
import { withTracker } from '../components/withTracker'

const HumanCommentCountSpan = ({ commentCount }) => (
  <span className='pull-right text-muted'>
    {commentCount ? `${commentCount} ${__('ui.comment', { count: commentCount })}` : ''}
  </span>
)

const humanCommentCountComposer = (props) => {
  const { docId, comments } = props
  const commentCount = comments ? comments.length : Comments.find({ docId }).count()
  return { commentCount, docId }
}

export const HumanCommentCount = withTracker(humanCommentCountComposer)(toClass(HumanCommentCountSpan))
