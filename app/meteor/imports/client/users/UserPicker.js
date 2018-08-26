import React from 'react'
import Select from 'react-select'
import { __ } from '../../i18n'
import { Users } from '../../api/users'

const toUser = _id => Users.findOne({ _id })

const toOption = (user) => {
  return {
    value: user._id,
    label: Users.methods.fullNameWithTitle(user)
  }
}

const toInitialOptions = (props) => {
  if (props.initialValue) {
    if (props.isMulti) {
      return props.initialValue.map(toUser).map(toOption)
    } else {
      return toOption(toUser(props.initialValue))
    }
  }
}

export class UserPicker extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      query: toInitialOptions(props) || ''
    }

    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.options = this.options.bind(this)
  }

  handleQueryChange (query) {
    this.setState({
      ...this.state,
      query: query
    })

    if (this.props.onChange && query) {
      if (this.props.isMulti && query.length >= 1) {
        this.props.onChange(query.map(q => q.value))
      } else {
        this.props.onChange(query.value)
      }
    } else {
      this.props.onChange(null)
    }
  }

  options () {
    const selector = this.props.selector || { groupId: { $ne: null }, employee: true }
    return Users.find(selector, {
      sort: { lastName: 1 }
    }).fetch().map(toOption)
  }

  render () {
    return (
      <Select
        value={this.state.query}
        onChange={this.handleQueryChange}
        options={this.options()}
        ignoreCase
        isClearable
        isMulti={this.props.isMulti}
        styles={customStyles}
        autoFocus={this.props.autoFocus || false}
        placeholder={this.props.placeholder || __('users.selectEmployee')} />
    )
  }
}

const customStyles = {
  menu: (base) => ({
    ...base,
    zIndex: 3
  })
}
