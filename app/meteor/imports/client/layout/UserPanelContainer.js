import React from 'react'
import { toClass } from 'recompose'
import { withRouter } from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'
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

    this.props.history.push('/')

    Meteor.defer(() => {
      Meteor.call('users/logout', () => {
        Meteor.logout()
      })
    })
  }

  render () {
    return (
      <UserPanel
        {...this.props}
        currentUser={this.props.currentUser}
        handleLogout={this.handleLogout}
        loggingOut={this.state.loggingOut} />
    )
  }
}

const composer = (props) => {
  const currentUser = Meteor.user()
  return { currentUser }
}

const UserPanelContainer = withTracker(composer)(toClass(withRouter(UserPanelContainerComponent)))

export { UserPanelContainer }
