import React from 'react'
import { Users } from '/imports/api/users'
import { Meteor } from 'meteor/meteor'

const Avatar = ({ _id }) => {
  let user = _id ? Users.findOne({ _id }) : Meteor.user()

  return (<div className='avatar username img-sm'>{ user.shortname() }</div>)
}

export { Avatar }
