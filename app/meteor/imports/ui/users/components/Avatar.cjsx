React = require 'react'
{ Meteor } = require 'meteor/meteor'
{ Users } = require '/imports/api/users'

class Avatar extends React.Component
  render: ->
    if @props._id
      user = Users.findOne({ _id: @props._id })
    else
      user = Meteor.user()

    <div className='avatar username img-sm'>{ user.shortname() }</div>

module.exports = { Avatar }
