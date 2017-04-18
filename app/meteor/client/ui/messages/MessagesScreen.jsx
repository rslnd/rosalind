import React from 'react'
import FlipMove from 'react-flip-move'
import { Box } from 'client/ui/components/Box'
import { RelativeTime } from 'client/ui/helpers/RelativeTime'

export class Message extends React.Component {
  render () {
    const { message, onCreateInboundCall } = this.props
    return (
      <div className="row">
        <div className="col-md-6">
          <span className="enable-select">{message.text}</span>
        </div>
        <div className="col-md-6 text-right text-muted">
          <p>
            +{message.from}<br />
            <RelativeTime time={message.createdAt} /><br />
            {
              onCreateInboundCall &&
                <a onClick={() => onCreateInboundCall(message)}>Create Inbound Call</a>
            }
          </p>
        </div>
        <div className="col-md-12">
          <hr />
        </div>
      </div>
    )
  }
}

const List = ({ messages, onCreateInboundCall }) => (
  <FlipMove>
    {messages.map((message) => (
      <Message message={message} key={message._id} onCreateInboundCall={onCreateInboundCall} />
    ))}
  </FlipMove>
)

export const MessagesScreen = ({ inbound, intentToCancel, onCreateInboundCall }) => (
  <div className="content">
    <div className="row">
      <div className="col-md-6">
        <Box title="Inbound messages matched as intent to cancel" icon="calendar-times-o">
          <List messages={intentToCancel} onCreateInboundCall={onCreateInboundCall} />
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
