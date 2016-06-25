import React from 'react'
import { Users } from '/imports/api/users'

const UserHelper = ({ _id, helper }) => {
  let user = Users.findOne({ _id })
  return (<span>{ helper ? user[helper].call(user)
    : user.fullNameWithTitle() }</span>)
}

export { UserHelper }
