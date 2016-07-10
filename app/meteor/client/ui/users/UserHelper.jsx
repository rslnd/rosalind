import React from 'react'
import { Users } from 'api/users'

export const UserHelper = ({ userId, helper }) => {
  let user = Users.findOne({ _id: userId })
  if (!user) { return null }
  if (helper) {
    return (<span>{user[helper](user)}</span>)
  } else {
    return (<span>{user.fullNameWithTitle()}</span>)
  }
}
