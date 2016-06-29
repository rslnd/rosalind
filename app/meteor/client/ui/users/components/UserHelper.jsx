import React from 'react'
import { Users } from 'api/users'

export class UserHelper extends React.Component {
  render () {
    let user = Users.findOne({ _id: this.props.userId })
    if (this.props.helper) {
      return (<span>{user[this.props.helper](user)}</span>)
    } else {
      return (<span>{user.fullNameWithTitle()}</span>)
    }
  }
}
