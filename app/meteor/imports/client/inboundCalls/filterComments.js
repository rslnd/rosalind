import React from 'react'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../i18n'

const filters = [
  {
    name: 'read',
    label: __('inboundCalls.read'),
    commentText:  __('inboundCalls.readCommentText'),
    action: 'setRead',
    when: i => !!i.pinnedBy
  },
  {
    name: 'unavailable',
    label: __('inboundCalls.unavailable'),
    action: 'setUnavailable',
    multiple: true,
    commentText: __('inboundCalls.unavailableCommentText'),
    when: i => !i.pinnedBy
  }
]

export const filterComments = ({ comments, Comments, inboundCall, enabled = true, setEnabled }) => {
  const filter = filters.find(f => f.when(inboundCall))

  const initial = {
    [filter.name]: [],
    comments: []
  }

  const buckets = comments.reduce((acc, comment) => {
    if (filter.commentText === comment.body) {
      if (filter) {
        const list = [
          ...(acc[filter.name] || []),
          comment
        ]

        return {
          ...acc,
          [filter.name]: list
        }
      } else {
        // regular comment
        return {
          ...acc,
          comments: [
            ...(acc.comments || []),
            comment
          ]
        }
      }
    } else {
      // regular comment
      return {
        ...acc,
        comments: [
          ...(acc.comments || []),
          comment
        ]
      }
    }
  }, initial)

  return {
    ...buckets,
    comments: enabled ? buckets.comments : comments,
    CommentsAction: CommentsAction({
      buckets,
      filter,
      inboundCall,
      onToggle: () => setEnabled(!enabled) })
  }
}

const CommentsAction = ({ filter, buckets, inboundCall, onToggle }) => () => {
    const alreadyClicked = (
      !filter.multiple &&
      buckets[filter.name].find(c => c.createdBy === Meteor.userId())
    )

    const handleClick = () => {
      if (!filter || alreadyClicked) {
          // noop when already clicked and not multiple: true
          return null
      }

      Meteor.call('comments/post', {
        body: filter.commentText,
        docId: inboundCall._id
      })

      Alert.success(filter.commentText)
    }

    return <span className='pull-right'>
      {
        buckets[filter.name].length >= 1 &&
          <span className='label label-primary pointer' onClick={onToggle}>
            {buckets[filter.name].length}
          </span>
      }
      &ensp;

      {
        alreadyClicked
        ? filter.label
        : <a onClick={handleClick}>
          {filter.label}
        </a>
      }
    </span>
}
