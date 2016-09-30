import React from 'react'
import { composeWithTracker } from 'react-komposer'
import { browserHistory } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { UserPanel } from './UserPanel'

class UserPanelContainerComponent extends React.Component {
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

    browserHistory.push('/')

    Meteor.defer(() => {
      Meteor.call('users/logout', () => {
        Meteor.logout()
      })
    })
  }

  render () {
    return (
      <UserPanel
        currentUser={this.props.currentUser}
        handleLogout={this.handleLogout}
        loggingOut={this.state.loggingOut} />
    )
  }
}

const composer = (props, onData) => {
  const currentUser = Meteor.user()
  onData(null, { currentUser })
}

const UserPanelContainer = composeWithTracker(composer)(UserPanelContainerComponent)

export { UserPanelContainer }
