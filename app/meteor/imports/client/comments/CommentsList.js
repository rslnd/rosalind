import React from 'react'
import concat from 'lodash/concat'
import reverse from 'lodash/reverse'
import { CommentItem } from './CommentItem'

const accumulateBy = field => list =>
  list.reduce((acc, curr) => {
    const lastGroup = acc.lastGroup
    const currGroup = curr[field]

    if (currGroup === lastGroup) {
      // append to last item
      const [last, ...rest] = reverse(acc.stack)
      const appended = {
        ...last,
        children: concat(last.children || [], curr)
      }
      const newStack = [...reverse(rest), appended]
      return { lastGroup: currGroup, stack: newStack }
    } else {
      // push new
      return { lastGroup: currGroup, stack: [...acc.stack, curr] }
    }
  }, { lastGroup: null, stack: [] }).stack

export const CommentsList = ({ comments, background = true }) => {
  if (comments.length === 0) {
    return null
  } else {
    return (
      <div className={`${!background && 'box-footer'} box-comments`}>
        {accumulateBy('createdBy')(comments).map((comment) => {
          return <CommentItem key={comment._id} comment={comment} />
        })}
      </div>
    )
  }
}
