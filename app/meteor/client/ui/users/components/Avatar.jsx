import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Users } from 'api/users'

export class Avatar extends React.Component {
  render () {
    let user

    if (this.props.userId) {
      user = Users.findOne({ _id: this.props.userId })
    } else {
      user = Meteor.user()
    }

    return (<div className='avatar username img-sm'>{user.shortname()}</div>)
  }
}
