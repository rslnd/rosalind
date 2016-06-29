import React from 'react'
import { CommentsList } from './CommentsList'
import { NewComment } from './NewComment'

export class CommentsBox extends React.Component {
  render () {
    return (<div>
      <CommentsList comments={this.props.comments} />
      <NewComment docId={this.props.docId} />
    </div>)
  }
}
