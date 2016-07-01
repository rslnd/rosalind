import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Users } from 'api/users'

export const Avatar = ({ userId }) => {
  let user

  if (userId) {
    user = Users.findOne({ _id: userId })
  } else {
    user = Meteor.user()
  }

  return (<div className="avatar username img-sm">{user.shortname()}</div>)
}
