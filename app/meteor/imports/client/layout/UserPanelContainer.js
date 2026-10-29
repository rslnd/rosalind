import React from 'react'
import { toClass } from 'recompose'
import { withRouter } from '../components/withRouter'
import { withTracker } from '../components/withTracker'
import { Meteor } from 'meteor/meteor'
import { UserPanel } from './UserPanel'
import { call } from '../../util/meteor/call'

class UserPanelContainerComponent extends React.Component {
  constructor (props) {
    super(props)

    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout () {
    this.props.onLogout()
    Meteor.defer(() => {
      const untrustedUserId = Meteor.userId()
      Meteor.logout()
      call('users/afterLogout', { untrustedUserId })
    })

    this.props.history.push('/')
  }

  render () {
    return (
      <UserPanel
        {...this.props}
        currentUser={this.props.currentUser}
        handleLogout={this.handleLogout}
      />
    )
  }
}

const composer = (props) => {
  const currentUser = Meteor.user()
  return { currentUser }
}

const UserPanelContainer = withTracker(composer)(toClass(withRouter(UserPanelContainerComponent)))

export { UserPanelContainer }
