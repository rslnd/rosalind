import React from 'react'
import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { Topbar } from './Topbar'

class TopbarContainerComponent extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loggingOut: false
    }

    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout () {
    this.setState({
      ...this.state,
      loggingOut: true
    })

    Meteor.call('users/logout', () => {
      Meteor.logout()
    })
  }

  render () {
    return (
      <Topbar
        username={this.props.username}
        handleLogout={this.handleLogout}
        loggingOut={this.state.loggingOut} />
    )
  }
}

const composer = (props, onData) => {
  const username = Meteor.user().fullNameWithTitle()
  onData(null, { username })
}

const TopbarContainer = composeWithTracker(composer)(TopbarContainerComponent)

export { TopbarContainer }
