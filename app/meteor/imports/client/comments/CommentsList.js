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

export const CommentsList = ({ style, comments, onClick, onRemove }) => {
  if (comments.length === 0) {
    return null
  } else {
    return (
      <div className='box-footer box-comments' style={style} onClick={onClick}>
        {accumulateBy('createdBy')(comments).map((comment) =>
          <CommentItem
            key={comment._id}
            comment={comment}
            onRemove={onRemove}
          />
        )}
      </div>
    )
  }
}
