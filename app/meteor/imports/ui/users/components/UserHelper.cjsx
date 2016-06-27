React = require 'react'
{ Users } = require '/imports/api/users'

class UserHelper extends React.Component
  render: ->
    user = Users.findOne({ _id: @props.userId })
    if @props.helper
      return <span>{ user[@props.helper].call(user) }</span>
    else
      return <span>{ user.fullNameWithTitle() }</span>

module.exports = { UserHelper }
