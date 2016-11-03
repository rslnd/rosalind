import React from 'react'
import Select from 'react-select'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from 'api/users'

export class UserPicker extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      query: ''
    }

    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.options = this.options.bind(this)
  }

  handleQueryChange (query) {
    this.setState({
      ...this.state,
      query: query
    })

    if (this.props.onChange && query && query.value) {
      this.props.onChange(query.value)
    }
  }

  options () {
    return Users.find({ groupId: { $ne: null } }, {
      sort: { 'profile.lastName': 1 }
    }).fetch().map((user) => {
      return {
        value: user._id,
        label: user.fullNameWithTitle()
      }
    })
  }

  render () {
    return (
      <Select
        value={this.state.query}
        onChange={this.handleQueryChange}
        options={this.options()}
        ignoreCase
        autofocus={this.props.autofocus || false}
        placeholder={TAPi18n.__('users.selectEmployee')} />
    )
  }
}
