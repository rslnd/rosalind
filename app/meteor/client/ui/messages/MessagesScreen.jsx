import React from 'react'
import FlipMove from 'react-flip-move'
import { Box } from 'client/ui/components/Box'
import { RelativeTime } from 'client/ui/helpers/RelativeTime'

export class Message extends React.Component {
  render () {
    const { message } = this.props
    return (
      <div>
        {message.text}
        <span className="text-muted pull-right">
          <RelativeTime time={message.createdAt} />
        </span>
        <hr />
      </div>
    )
  }
}

const List = ({ messages }) => (
  <FlipMove>
    {messages.map((message) => (
      <Message message={message} key={message._id} />
    ))}
  </FlipMove>
)

export const MessagesScreen = ({ inbound, intentToCancel }) => (
  <div className="content">
    <div className="row">
      <div className="col-md-6">
        <Box title="Inbound messages matched as intent to cancel" icon="calendar-times-o">
          <List messages={intentToCancel} />
        </Box>
      </div>

      <div className="col-md-6">
        <Box title="Other inbound messages" icon="comment-o">
          <List messages={inbound} />
        </Box>
      </div>
    </div>
  </div>
)
